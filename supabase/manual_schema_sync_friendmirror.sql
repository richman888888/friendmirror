/*
 * 在 Supabase → SQL Editor 中整段执行（Ctrl+A 全选 → Run）。
 * 解决：Could not find the 'referred_by' column of 'profiles' in the schema cache
 * 以及其它 FriendMirror 增量列未落库 / PostgREST 缓存未刷新。
 *
 * 可重复执行（IF NOT EXISTS / OR REPLACE）。
 */

-- profiles: 裂变
alter table public.profiles
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;
alter table public.profiles
  add column if not exists invite_count integer not null default 0;
alter table public.profiles
  add column if not exists signup_share_source text;

create index if not exists profiles_referred_by_idx on public.profiles (referred_by);
create index if not exists profiles_signup_share_source_idx
  on public.profiles (signup_share_source)
  where signup_share_source is not null;

-- events: 分享落地 / 引荐页
alter table public.events
  add column if not exists ref_share_code text;
alter table public.events
  add column if not exists share_source text;

create index if not exists events_ref_share_code_idx
  on public.events (ref_share_code)
  where ref_share_code is not null;
create index if not exists events_share_source_idx
  on public.events (share_source)
  where share_source is not null;

-- 邀请计数触发器
create or replace function public.bump_invite_count_on_referred()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.referred_by is not null then
    update public.profiles
    set invite_count = invite_count + 1
    where id = new.referred_by;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_referral_after_insert on public.profiles;
create trigger profiles_referral_after_insert
after insert on public.profiles
for each row
when (new.referred_by is not null)
execute function public.bump_invite_count_on_referred();

-- 全站参与人数（匿名可调）
create or replace function public.fetch_public_engagement()
returns table (profile_count bigint, vote_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::bigint from public.profiles),
    (select count(*)::bigint from public.votes);
$$;

revoke all on function public.fetch_public_engagement() from public;
grant execute on function public.fetch_public_engagement() to anon;
grant execute on function public.fetch_public_engagement() to authenticated;

-- 可选：回填 invite_count（有 referred_by 的历史数据）
update public.profiles p
set invite_count = coalesce(sub.c, 0)
from (
  select referred_by as id, count(*)::integer as c
  from public.profiles
  where referred_by is not null
  group by referred_by
) sub
where p.id = sub.id;

-- 强制 PostgREST 重载 schema 缓存（消除 “schema cache” 报错）
notify pgrst, 'reload schema';

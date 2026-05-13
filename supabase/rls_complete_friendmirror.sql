/*
 * FriendMirror — RLS + 表结构 + RPC（整份复制到 Supabase SQL Editor 执行）
 * 不要只粘贴文件名；全选本文件内容 Ctrl+A → 复制 → SQL Editor 粘贴 → Run
 *
 * 要点：
 * - votes：匿名可 INSERT；匿名不可 SELECT（避免暴露 voter_fingerprint）
 * - 统计：仅用 RPC fetch_vote_tag_counts（只返回 tag + cnt）
 * - profiles：匿名可 INSERT / SELECT（按 share_code 查单条在应用层用 .eq 过滤；
 *   若需禁止枚举全表，可再改为仅 SECURITY DEFINER 函数 + 撤销 anon 对 profiles 的 SELECT）
 * - orders：RLS 开启且无 anon 策略 = 匿名无法 CRUD
 */

-- ---------------------------------------------------------------------------
-- 表（已存在则跳过）
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  avatar_url text,
  share_code text not null unique,
  referred_by uuid references public.profiles (id) on delete set null,
  invite_count integer not null default 0,
  signup_share_source text,
  plan text not null default 'free',
  payment_status text not null default 'none',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tag text not null,
  voter_fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists votes_profile_id_idx on public.votes (profile_id);
create index if not exists votes_profile_fingerprint_idx on public.votes (profile_id, voter_fingerprint);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  profile_id uuid references public.profiles (id) on delete set null,
  ref_share_code text,
  share_source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_profile_id_idx on public.events (profile_id);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_ref_share_code_idx
  on public.events (ref_share_code)
  where ref_share_code is not null;
create index if not exists events_share_source_idx
  on public.events (share_source)
  where share_source is not null;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  amount integer not null,
  currency text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_profile_id_idx on public.orders (profile_id);

alter table public.profiles
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;
alter table public.profiles
  add column if not exists invite_count integer not null default 0;
alter table public.events
  add column if not exists ref_share_code text;
alter table public.events
  add column if not exists share_source text;
alter table public.profiles
  add column if not exists signup_share_source text;

create index if not exists profiles_signup_share_source_idx
  on public.profiles (signup_share_source)
  where signup_share_source is not null;

create index if not exists profiles_referred_by_idx on public.profiles (referred_by);

-- ---------------------------------------------------------------------------
-- 1) 四张表全部启用 RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.votes enable row level security;
alter table public.events enable row level security;
alter table public.orders enable row level security;

-- ---------------------------------------------------------------------------
-- Storage（头像上传用，与 RLS 配套）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_anon" on storage.objects;
create policy "avatars_insert_anon"
on storage.objects for insert
to anon
with check (bucket_id = 'avatars');

-- ---------------------------------------------------------------------------
-- RPC：按 share_code 统计标签票数（不返回 voter_fingerprint）
-- 另：replace_votes_for_share 供应用「覆盖同一指纹的投票」
-- ---------------------------------------------------------------------------
create or replace function public.replace_votes_for_share(
  p_share_code text,
  p_fingerprint text,
  p_tags text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  fp text := left(coalesce(p_fingerprint, ''), 256);
  t text;
begin
  select id into pid
  from public.profiles
  where share_code = p_share_code
  limit 1;

  if pid is null then
    raise exception 'profile_not_found';
  end if;

  delete from public.votes
  where profile_id = pid and voter_fingerprint = fp;

  foreach t in array coalesce(p_tags, '{}')
  loop
    insert into public.votes (profile_id, tag, voter_fingerprint)
    values (pid, t, fp);
  end loop;
end;
$$;

revoke all on function public.replace_votes_for_share(text, text, text[]) from public;
grant execute on function public.replace_votes_for_share(text, text, text[]) to anon;
grant execute on function public.replace_votes_for_share(text, text, text[]) to authenticated;

create or replace function public.fetch_vote_tag_counts(p_share_code text)
returns table (tag text, cnt bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.tag, count(*)::bigint as cnt
  from public.votes v
  inner join public.profiles p on p.id = v.profile_id
  where p.share_code = p_share_code
  group by v.tag;
$$;

revoke all on function public.fetch_vote_tag_counts(text) from public;
grant execute on function public.fetch_vote_tag_counts(text) to anon;
grant execute on function public.fetch_vote_tag_counts(text) to authenticated;

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

-- ---------------------------------------------------------------------------
-- 清理旧策略名（避免重复执行报错）
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_insert_anon" on public.profiles;
drop policy if exists "profiles_anon_select" on public.profiles;
drop policy if exists "profiles_anon_insert" on public.profiles;

drop policy if exists "votes_anon_insert" on public.votes;
drop policy if exists "votes_anon_select" on public.votes;

drop policy if exists "events_insert_anon" on public.events;
drop policy if exists "events_anon_insert" on public.events;

drop policy if exists "orders_anon_all" on public.orders;
drop policy if exists "orders_anon_select" on public.orders;
drop policy if exists "orders_anon_insert" on public.orders;

-- ---------------------------------------------------------------------------
-- 2–5) profiles / events：匿名 INSERT；profiles 匿名 SELECT（配合 share_code 查询）
-- ---------------------------------------------------------------------------
create policy "profiles_anon_insert"
on public.profiles for insert
to anon
with check (true);

create policy "profiles_anon_select"
on public.profiles for select
to anon
using (true);

create policy "events_anon_insert"
on public.events for insert
to anon
with check (true);

-- ---------------------------------------------------------------------------
-- 3) votes：匿名 INSERT（不授予 SELECT，避免暴露 voter_fingerprint）
-- ---------------------------------------------------------------------------
create policy "votes_anon_insert"
on public.votes for insert
to anon
with check (
  profile_id in (select pr.id from public.profiles pr)
);

-- 6) 统计：请使用 RPC fetch_vote_tag_counts；不要为 anon 添加 votes 的 SELECT 策略

-- ---------------------------------------------------------------------------
-- 7) orders：不添加任何 anon 策略 ⇒ 匿名无法 select/insert/update/delete
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';

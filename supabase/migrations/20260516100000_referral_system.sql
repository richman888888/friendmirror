-- FriendMirror: referral columns + invite_count trigger + events.ref_share_code

alter table public.profiles
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

alter table public.profiles
  add column if not exists invite_count integer not null default 0;

create index if not exists profiles_referred_by_idx on public.profiles (referred_by);

alter table public.events
  add column if not exists ref_share_code text;

create index if not exists events_ref_share_code_idx
  on public.events (ref_share_code)
  where ref_share_code is not null;

-- Bump inviter's invite_count (runs as definer so anon insert can still update referrer row)
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

-- Backfill invite_count from existing referred_by rows (one-time)
update public.profiles p
set invite_count = coalesce(sub.c, 0)
from (
  select referred_by as id, count(*)::integer as c
  from public.profiles
  where referred_by is not null
  group by referred_by
) sub
where p.id = sub.id;

notify pgrst, 'reload schema';

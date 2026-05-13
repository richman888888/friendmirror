-- Viral share: landing / signup source + public engagement counts (anon RPC)

alter table public.events
  add column if not exists share_source text;

alter table public.profiles
  add column if not exists signup_share_source text;

create index if not exists events_share_source_idx
  on public.events (share_source)
  where share_source is not null;

create index if not exists profiles_signup_share_source_idx
  on public.profiles (signup_share_source)
  where signup_share_source is not null;

-- Public totals for social proof (no fingerprint exposure)
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

notify pgrst, 'reload schema';

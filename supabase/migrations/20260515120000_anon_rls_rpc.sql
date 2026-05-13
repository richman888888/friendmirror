-- FriendMirror: anonymous (anon key) access via RLS + SECURITY DEFINER RPCs.
-- Apply after 20260514120000_friendmirror_init.sql (tables + buckets).

-- ---------------------------------------------------------------------------
-- RPC: replace all votes for one visitor on a profile (identified by share_code)
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

-- ---------------------------------------------------------------------------
-- RPC: aggregate vote counts by tag for a share_code (no fingerprint leak)
-- ---------------------------------------------------------------------------
create or replace function public.fetch_vote_tag_counts(p_share_code text)
returns table (tag text, cnt bigint)
language sql
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

-- ---------------------------------------------------------------------------
-- RLS: profiles — public read + anonymous insert (no login, phase 1)
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "profiles_insert_anon" on public.profiles;
create policy "profiles_insert_anon"
on public.profiles for insert
to anon, authenticated
with check (true);

-- ---------------------------------------------------------------------------
-- RLS: votes — no direct anon DML (use replace_votes_for_share)
-- ---------------------------------------------------------------------------
-- Intentionally no insert/update/delete/select policies for anon on votes.

-- ---------------------------------------------------------------------------
-- RLS: events — optional client/server logging with anon insert
-- ---------------------------------------------------------------------------
drop policy if exists "events_insert_anon" on public.events;
create policy "events_insert_anon"
on public.events for insert
to anon, authenticated
with check (true);

-- ---------------------------------------------------------------------------
-- Storage: allow anon uploads into avatars (paths prefixed by app, e.g. incoming/)
-- ---------------------------------------------------------------------------
drop policy if exists "avatars_insert_anon" on storage.objects;
create policy "avatars_insert_anon"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'avatars');

notify pgrst, 'reload schema';

-- FriendMirror: profiles, votes, events, orders (+ public avatar bucket)
-- RLS enabled; use service role from server actions (bypasses RLS).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  avatar_url text,
  share_code text not null unique,
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_profile_id_idx on public.events (profile_id);
create index if not exists events_event_name_idx on public.events (event_name);

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

alter table public.profiles enable row level security;
alter table public.votes enable row level security;
alter table public.events enable row level security;
alter table public.orders enable row level security;

-- Storage: public read for rendered avatars; uploads via service role only.
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

notify pgrst, 'reload schema';

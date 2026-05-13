-- 修复：Could not find the 'referred_by' column of 'profiles' in the schema cache
-- 在 Supabase Dashboard → SQL Editor → 粘贴全文 → Run

alter table public.profiles
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

alter table public.profiles
  add column if not exists invite_count integer not null default 0;

-- 让 PostgREST 立刻重载 schema 缓存（必跑）
notify pgrst, 'reload schema';

-- 自检（应返回 1 行 referred_by）
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('referred_by', 'invite_count')
order by column_name;

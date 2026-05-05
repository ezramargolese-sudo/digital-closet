-- Run this in Supabase SQL Editor AFTER 0001_init.sql.
-- Adds size/price to items, worn_count + seasons to outfits, plus auth/social tables.

-- ============== Extras on existing tables ==============

alter table items   add column if not exists size   text;
alter table items   add column if not exists price  numeric;
alter table outfits add column if not exists worn_count int not null default 0;
alter table outfits add column if not exists seasons    jsonb not null default '[]'::jsonb;

-- ============== Per-user scoping ==============

alter table items   add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table outfits add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table trips   add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists items_user_idx   on items(user_id);
create index if not exists outfits_user_idx on outfits(user_id);
create index if not exists trips_user_idx   on trips(user_id);

-- ============== Profiles (linked to auth.users) ==============

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  first_name  text not null,
  last_name   text not null,
  username    text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);
create index if not exists profiles_username_idx on profiles(lower(username));

-- ============== Friend requests ==============

create table if not exists friend_requests (
  id          bigserial primary key,
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending',  -- pending|accepted|rejected
  created_at  timestamptz not null default now(),
  unique(from_user, to_user)
);
create index if not exists friend_requests_to_idx on friend_requests(to_user, status);

-- ============== Friendships (canonical: user_a < user_b) ==============

create table if not exists friendships (
  user_a      uuid not null references auth.users(id) on delete cascade,
  user_b      uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

-- ============== Notifications ==============

create table if not exists notifications (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  payload     jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

-- ============== RLS ==============
-- We enable RLS but use the service-role key on the server which bypasses it.
-- Safe default: anon clients can't read anything sensitive.

alter table profiles enable row level security;
alter table friend_requests enable row level security;
alter table friendships enable row level security;
alter table notifications enable row level security;

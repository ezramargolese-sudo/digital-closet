-- Digital Closet schema. Run this once in Supabase → SQL Editor.

create table if not exists items (
  id          bigserial primary key,
  name        text not null,
  category    text not null,
  color       text not null,
  brand       text,
  tags        jsonb not null default '[]'::jsonb,
  image_url   text not null,
  warmth      int  not null default 3,
  created_at  timestamptz not null default now(),
  last_worn_at timestamptz
);

create table if not exists outfits (
  id          bigserial primary key,
  name        text not null,
  style       text not null default 'casual',
  item_ids    jsonb not null default '[]'::jsonb,
  favorite    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists trips (
  id          bigserial primary key,
  name        text not null,
  destination text,
  start_date  date,
  end_date    date,
  item_ids    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- We use the service-role key on the server, which bypasses RLS, so policies
-- aren't strictly required. Leaving RLS enabled (Supabase default) means the
-- public anon key cannot read these tables, which is what we want.
alter table items enable row level security;
alter table outfits enable row level security;
alter table trips enable row level security;

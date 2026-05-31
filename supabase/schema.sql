-- FamilyCircle database schema
-- Paste this into: Supabase Dashboard → SQL Editor → New Query → Run

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  email text not null,
  photo_url text,
  circle_ids text[] default '{}',
  created_at timestamptz default now()
);

-- Circles
create table public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.users(id) on delete cascade,
  invite_code text not null unique,
  invite_expiry timestamptz not null,
  member_ids text[] default '{}',
  created_at timestamptz default now()
);

-- Circle members (denormalized for easy display name lookup)
create table public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  display_name text not null,
  photo_url text,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

-- Live locations (one row per user, upserted on every GPS update)
create table public.locations (
  user_id uuid references public.users(id) on delete cascade primary key,
  circle_id uuid references public.circles(id) on delete cascade,
  display_name text,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision,
  heading double precision,
  battery_level integer default -1,
  updated_at timestamptz default now()
);

-- Helper: append a circle ID to a user's circle_ids array
create or replace function append_circle_id(user_id uuid, circle_id text)
returns void language sql as $$
  update public.users
  set circle_ids = array_append(circle_ids, circle_id)
  where id = user_id and not (circle_ids @> array[circle_id]);
$$;

-- Helper: append a member ID to a circle's member_ids array
create or replace function append_member_id(circle_id uuid, member_id text)
returns void language sql as $$
  update public.circles
  set member_ids = array_append(member_ids, member_id)
  where id = circle_id and not (member_ids @> array[member_id]);
$$;

-- Enable real-time for locations table
alter publication supabase_realtime add table public.locations;

-- Row Level Security
alter table public.users enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.locations enable row level security;

create policy "Users can read and update their own profile"
  on public.users for all using (auth.uid() = id);

create policy "Circle members can read their circle"
  on public.circles for select using (auth.uid()::text = any(member_ids));

create policy "Circle owner can update their circle"
  on public.circles for update using (auth.uid() = owner_id);

create policy "Anyone authenticated can create a circle"
  on public.circles for insert with check (auth.uid() = owner_id);

create policy "Circle members can read members list"
  on public.circle_members for select using (auth.role() = 'authenticated');

create policy "Users can insert themselves as members"
  on public.circle_members for insert with check (auth.uid() = user_id);

create policy "Authenticated users can read locations"
  on public.locations for select using (auth.role() = 'authenticated');

create policy "Users can upsert their own location"
  on public.locations for all using (auth.uid() = user_id);

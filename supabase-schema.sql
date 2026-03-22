-- Museum Guide Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Museums table
create table museums (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  category text not null check (category in ('history', 'science', 'art', 'nature', 'children', 'experience')),
  hours text not null,
  price text not null,
  description text not null,
  image_url text,
  phone text,
  website text,
  region text not null,
  target_age_min integer not null default 0,
  target_age_max integer not null default 18,
  created_at timestamptz default now()
);

-- Programs table
create table programs (
  id uuid default uuid_generate_v4() primary key,
  museum_id uuid references museums(id) on delete cascade not null,
  name text not null,
  target_age text not null,
  schedule text not null,
  price text not null,
  description text
);

-- Reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  museum_id uuid references museums(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text not null,
  child_age integer,
  created_at timestamptz default now()
);

-- Favorites table
create table favorites (
  id uuid default uuid_generate_v4() primary key,
  museum_id uuid references museums(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(museum_id, user_id)
);

-- Visits table
create table visits (
  id uuid default uuid_generate_v4() primary key,
  museum_id uuid references museums(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  visited_at date not null default current_date,
  memo text default '',
  created_at timestamptz default now()
);

-- Profiles table
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nickname text not null default '',
  children_info jsonb default '[]'::jsonb,
  region text default '',
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table museums enable row level security;
alter table programs enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table visits enable row level security;
alter table profiles enable row level security;

-- Museums: everyone can read
create policy "Museums are viewable by everyone" on museums for select using (true);

-- Programs: everyone can read
create policy "Programs are viewable by everyone" on programs for select using (true);

-- Reviews: everyone can read, authenticated users can insert, owners can update/delete
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can insert reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);

-- Favorites: only own data
create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on favorites for delete using (auth.uid() = user_id);

-- Visits: own data for CRUD, everyone can see aggregated counts
create policy "Users can view own visits" on visits for select using (auth.uid() = user_id);
create policy "Users can insert own visits" on visits for insert with check (auth.uid() = user_id);
create policy "Users can update own visits" on visits for update using (auth.uid() = user_id);
create policy "Users can delete own visits" on visits for delete using (auth.uid() = user_id);

-- Profiles: everyone can read (for ranking), only own profile can be updated
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Enable Realtime for reviews
alter publication supabase_realtime add table reviews;

-- Index for performance
create index idx_reviews_museum_id on reviews(museum_id);
create index idx_favorites_user_id on favorites(user_id);
create index idx_visits_user_id on visits(user_id);
create index idx_museums_region on museums(region);
create index idx_museums_category on museums(category);

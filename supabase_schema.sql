-- Create profiles table in the public schema
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  blood_group text not null,
  phone text not null,
  division text not null,
  district text not null,
  upazila text not null,
  last_donation_date date,
  is_available boolean default true not null,
  initial_donation_count integer default 0 not null,
  gender text default 'male' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Migration commands for existing profiles table:
-- alter table public.profiles add column if not exists initial_donation_count integer default 0 not null;
-- alter table public.profiles add column if not exists gender text default 'male' not null;

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create RLS Policies
-- 1. Profiles are publicly viewable so seekers can search for donors without logging in
create policy "Profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- 2. Donors can update their own profile information after logging in
create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 3. Donors can insert their own profile (in case they do it manually, though trigger handles it)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger function to automatically create a profile when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, blood_group, phone, division, district, upazila, last_donation_date, is_available, initial_donation_count, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'blood_group', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'division', ''),
    coalesce(new.raw_user_meta_data->>'district', ''),
    coalesce(new.raw_user_meta_data->>'upazila', ''),
    null,
    true,
    0,
    'male'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on new auth.users insertion
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create donation_history table
create table public.donation_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  donation_date date not null,
  note text,
  created_at timestamptz default now() not null
);

-- Enable RLS on donation_history
alter table public.donation_history enable row level security;

-- Policies for donation_history
create policy "Donation history viewable by everyone"
  on public.donation_history for select
  using (true);

create policy "Users can insert their own donation history"
  on public.donation_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own donation history"
  on public.donation_history for delete
  using (auth.uid() = user_id);


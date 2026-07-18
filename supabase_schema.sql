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
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

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
  insert into public.profiles (id, full_name, blood_group, phone, division, district, upazila, last_donation_date, is_available)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'blood_group', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'division', ''),
    coalesce(new.raw_user_meta_data->>'district', ''),
    coalesce(new.raw_user_meta_data->>'upazila', ''),
    null,
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on new auth.users insertion
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

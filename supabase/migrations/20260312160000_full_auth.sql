-- =============================================
-- Full Auth System Migration
-- =============================================

-- 1. Create admins table
create table if not exists public.admins (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  secret_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admins enable row level security;

create policy "Admins can view admins."
on public.admins for select
using (auth.email() in (select email from public.admins));

-- 2. Add phone_number and is_verified to users table
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'phone_number') then
    alter table public.users add column phone_number text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'is_verified') then
    alter table public.users add column is_verified boolean default false;
  end if;
end $$;

-- 3. Replace is_admin() function to check admins table
create or replace function public.is_admin() returns boolean as $$
begin
  return exists (
    select 1 from public.admins where email = auth.email()
  );
end;
$$ language plpgsql security definer;

-- 4. Allow users to insert their own profile row on signup
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own profile.' and tablename = 'users') then
    create policy "Users can insert own profile." on public.users for insert with check (auth.uid() = id);
  end if;
end $$;

-- =============================================
-- INSERT YOUR ADMIN EMAIL BELOW
-- =============================================
-- INSERT INTO public.admins (email) VALUES ('your-admin@email.com');

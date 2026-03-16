-- =============================================
-- Admins Table & Updated Auth
-- =============================================

-- Create admins table to store authorized admin emails
create table if not exists public.admins (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admins enable row level security;

-- Only admins can view the admins table
create policy "Admins can view admins."
on public.admins for select
using (
  auth.email() in (select email from public.admins)
);

-- Replace the is_admin() function to check admins table
create or replace function public.is_admin() returns boolean as $$
begin
  return exists (
    select 1 from public.admins where email = auth.email()
  );
end;
$$ language plpgsql security definer;

-- =============================================
-- INSERT YOUR ADMIN EMAIL BELOW
-- =============================================
-- INSERT INTO public.admins (email) VALUES ('your-admin@email.com');

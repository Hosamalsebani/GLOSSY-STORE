-- Create newsletter_subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Policies
create policy "Anyone can subscribe to the newsletter." 
on public.newsletter_subscribers for insert 
with check (true);

create policy "Admins can view subscribers." 
on public.newsletter_subscribers for select 
using (public.is_admin());

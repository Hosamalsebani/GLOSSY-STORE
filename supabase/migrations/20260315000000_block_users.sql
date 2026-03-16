-- Add is_blocked column to users table
alter table public.users add column if not exists is_blocked boolean default false;

-- Add comment explaining the column
comment on column public.users.is_blocked is 'Flag to indicate if a user is blocked from accessing the store.';

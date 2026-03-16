-- Create product_reviews table
create table public.product_reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.product_reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone." 
on public.product_reviews for select using (true);

create policy "Authenticated users can insert their own reviews." 
on public.product_reviews for insert 
with check (auth.uid() = user_id);

create policy "Users can delete their own reviews."
on public.product_reviews for delete
using (auth.uid() = user_id);

create policy "Admins can manage all reviews."
on public.product_reviews for all
using (public.is_admin());

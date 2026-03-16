-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table extending Supabase Auth
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  stock integer default 0,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mystery Boxes
create table public.mystery_boxes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete set null,
  status text default 'pending',
  total numeric not null,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  quantity integer not null,
  price numeric not null
);

-- Sliders
create table public.sliders (
  id uuid default uuid_generate_v4() primary key,
  image_url text not null,
  title text not null,
  subtitle text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shipping Zones
create table public.shipping_zones (
  id uuid default uuid_generate_v4() primary key,
  city text not null,
  cost numeric not null,
  estimated_days text
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.mystery_boxes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.sliders enable row level security;
alter table public.shipping_zones enable row level security;

-- Policies

-- Read Access for Public
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Mystery boxes are viewable by everyone." on public.mystery_boxes for select using (true);
create policy "Sliders are viewable by everyone." on public.sliders for select using (true);
create policy "Shipping zones are viewable by everyone." on public.shipping_zones for select using (true);

-- Admin Function
create function public.is_admin() returns boolean as $$
declare
  user_role text;
begin
  select role into user_role from public.users where id = auth.uid();
  return user_role = 'admin';
end;
$$ language plpgsql security definer;

-- Admin Write Access
create policy "Admins can insert products." on public.products for insert with check (public.is_admin());
create policy "Admins can update products." on public.products for update using (public.is_admin());
create policy "Admins can delete products." on public.products for delete using (public.is_admin());

create policy "Admins can insert mystery boxes." on public.mystery_boxes for insert with check (public.is_admin());
create policy "Admins can update mystery boxes." on public.mystery_boxes for update using (public.is_admin());
create policy "Admins can delete mystery boxes." on public.mystery_boxes for delete using (public.is_admin());

create policy "Admins can insert sliders." on public.sliders for insert with check (public.is_admin());
create policy "Admins can update sliders." on public.sliders for update using (public.is_admin());
create policy "Admins can delete sliders." on public.sliders for delete using (public.is_admin());

create policy "Admins can insert shipping zones." on public.shipping_zones for insert with check (public.is_admin());
create policy "Admins can update shipping zones." on public.shipping_zones for update using (public.is_admin());
create policy "Admins can delete shipping zones." on public.shipping_zones for delete using (public.is_admin());

-- User Access
create policy "Users can view own profile." on public.users for select using (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);
create policy "Admins can view all users." on public.users for select using (public.is_admin());

create policy "Users can view own orders." on public.orders for select using (auth.uid() = user_id);
create policy "Users can create own orders." on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders." on public.orders for select using (public.is_admin());
create policy "Admins can update all orders." on public.orders for update using (public.is_admin());

create policy "Users can view own order items." on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can insert own order items." on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admins can view all order items." on public.order_items for select using (public.is_admin());

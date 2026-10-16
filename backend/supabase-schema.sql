-- RYUA production data model
-- Apply this migration only to the intended Supabase project.
-- The storefront must use the publishable key only; never expose service_role.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  price_aed numeric(10,2) not null check (price_aed >= 0),
  image_url text not null default '',
  colors text[] not null default '{}',
  category text not null default 'sunglasses',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('RY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (char_length(customer_phone) between 7 and 30),
  delivery_area text not null default '',
  notes text not null default '',
  status text not null default 'new' check (status in ('new','confirmed','preparing','shipped','completed','cancelled')),
  total_aed numeric(10,2) not null check (total_aed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  color text not null default '',
  quantity integer not null check (quantity between 1 and 20),
  unit_price_aed numeric(10,2) not null check (unit_price_aed >= 0)
);

create index if not exists products_active_idx on public.products(active);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "public can view active sunglasses" on public.products;
create policy "public can view active sunglasses"
  on public.products for select to anon, authenticated
  using (active = true);

-- Orders are intentionally not directly readable by the public storefront.
-- Create orders through a validated Edge Function using service_role server-side.
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
grant select on public.products to anon, authenticated;

-- Admin access is granted only to authenticated staff through policies added
-- after the project creates the staff account. Do not use a client-side password.

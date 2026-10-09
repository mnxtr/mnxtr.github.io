-- TANVORA catalogue and private enquiries. Apply only to a dedicated TANVORA project.
create extension if not exists pgcrypto with schema extensions;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('mens-bags', 'womens-bags', 'wallets')),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug),
  material text not null,
  description text not null,
  dimensions text not null,
  features text[] not null default '{}',
  image_index integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  colour text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  price_bdt integer not null check (price_bdt >= 0),
  available boolean not null default false,
  is_active boolean not null default true
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  url text not null check (url ~ '^https://'),
  alt text not null,
  sort_order integer not null default 0
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reference text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_slug) where is_published = true;
create index variants_product_idx on public.product_variants(product_id);
create index images_product_idx on public.product_images(product_id, sort_order);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.enquiries enable row level security;

-- Explicit grants are required on new Supabase projects where Data API
-- access is no longer automatically granted for public schema tables.
grant usage on schema public to anon;
grant select on public.categories, public.products, public.product_variants, public.product_images to anon;
revoke all on public.enquiries from anon, authenticated;

create policy "Active categories are public" on public.categories for select to anon using (is_active);
create policy "Published products are public" on public.products for select to anon using (is_published);
create policy "Active variants of published products are public" on public.product_variants for select to anon
  using (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "Images of published products are public" on public.product_images for select to anon
  using (exists (select 1 from public.products p where p.id = product_id and p.is_published));

insert into public.categories (slug, name, sort_order) values
  ('womens-bags', 'Women’s Bags', 1),
  ('mens-bags', 'Men’s Bags', 2),
  ('wallets', 'Wallets', 3);

-- No sample products or contact details are inserted into a live database.

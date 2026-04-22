
-- ============================================================
-- ROUND A: Marketplace foundation
-- ============================================================

-- 0. Enums --------------------------------------------------------------
do $$ begin
  create type public.listing_kind as enum ('product','service','local','shop');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending','paid','fulfilled','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.local_condition as enum ('new','like_new','used','for_parts');
exception when duplicate_object then null; end $$;

-- 1. Helpers ------------------------------------------------------------
create or replace function public.slugify(p text)
returns text language sql immutable as $$
  select regexp_replace(
    regexp_replace(lower(coalesce(p,'')), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  )
$$;

-- Reuse existing set_updated_at() trigger fn

-- 2. Shops --------------------------------------------------------------
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  banner_url text,
  avatar_url text,
  rating numeric not null default 0,
  rating_count integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shops_owner_idx on public.shops(owner_id);
alter table public.shops enable row level security;

drop policy if exists "Shops: read all auth" on public.shops;
create policy "Shops: read all auth" on public.shops for select to authenticated using (true);
drop policy if exists "Shops: owner insert" on public.shops;
create policy "Shops: owner insert" on public.shops for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Shops: owner update" on public.shops;
create policy "Shops: owner update" on public.shops for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Shops: owner delete" on public.shops;
create policy "Shops: owner delete" on public.shops for delete to authenticated using (auth.uid() = owner_id);
drop policy if exists "Shops: admins manage" on public.shops;
create policy "Shops: admins manage" on public.shops for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at before update on public.shops
  for each row execute function public.set_updated_at();

-- 3. Service listings --------------------------------------------------
create table if not exists public.service_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'general',
  cover_url text,
  delivery_days integer not null default 3,
  base_price_cents integer not null,
  rating numeric not null default 0,
  rating_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists service_listings_owner_idx on public.service_listings(owner_id);
create index if not exists service_listings_category_idx on public.service_listings(category);
alter table public.service_listings enable row level security;

drop policy if exists "Services: read all auth" on public.service_listings;
create policy "Services: read all auth" on public.service_listings for select to authenticated using (true);
drop policy if exists "Services: owner insert" on public.service_listings;
create policy "Services: owner insert" on public.service_listings for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Services: owner update" on public.service_listings;
create policy "Services: owner update" on public.service_listings for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Services: owner delete" on public.service_listings;
create policy "Services: owner delete" on public.service_listings for delete to authenticated using (auth.uid() = owner_id);
drop policy if exists "Services: admins manage" on public.service_listings;
create policy "Services: admins manage" on public.service_listings for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

drop trigger if exists service_listings_set_updated_at on public.service_listings;
create trigger service_listings_set_updated_at before update on public.service_listings
  for each row execute function public.set_updated_at();

create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.service_listings(id) on delete cascade,
  tier text not null check (tier in ('basic','standard','premium')),
  title text not null,
  description text,
  price_cents integer not null,
  delivery_days integer not null default 3,
  revisions integer not null default 1,
  created_at timestamptz not null default now()
);
create unique index if not exists service_packages_uniq_tier on public.service_packages(service_id, tier);
alter table public.service_packages enable row level security;

drop policy if exists "Packages: read all auth" on public.service_packages;
create policy "Packages: read all auth" on public.service_packages for select to authenticated using (true);
drop policy if exists "Packages: owner write" on public.service_packages;
create policy "Packages: owner write" on public.service_packages for all to authenticated
  using (exists (select 1 from public.service_listings s where s.id = service_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.service_listings s where s.id = service_id and s.owner_id = auth.uid()));
drop policy if exists "Packages: admins manage" on public.service_packages;
create policy "Packages: admins manage" on public.service_packages for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

-- 4. Local listings ----------------------------------------------------
create table if not exists public.local_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  price_cents integer not null,
  condition public.local_condition not null default 'used',
  city text,
  region text,
  country text default 'Global',
  cover_url text,
  contact_method text not null default 'chat',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists local_listings_owner_idx on public.local_listings(owner_id);
create index if not exists local_listings_city_idx on public.local_listings(city);
alter table public.local_listings enable row level security;

drop policy if exists "Local: read all auth" on public.local_listings;
create policy "Local: read all auth" on public.local_listings for select to authenticated using (true);
drop policy if exists "Local: owner insert" on public.local_listings;
create policy "Local: owner insert" on public.local_listings for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Local: owner update" on public.local_listings;
create policy "Local: owner update" on public.local_listings for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Local: owner delete" on public.local_listings;
create policy "Local: owner delete" on public.local_listings for delete to authenticated using (auth.uid() = owner_id);
drop policy if exists "Local: admins manage" on public.local_listings;
create policy "Local: admins manage" on public.local_listings for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

drop trigger if exists local_listings_set_updated_at on public.local_listings;
create trigger local_listings_set_updated_at before update on public.local_listings
  for each row execute function public.set_updated_at();

-- 5. Orders ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete set null,
  listing_kind public.listing_kind not null,
  listing_id uuid not null,
  title text not null,
  amount_cents integer not null check (amount_cents >= 0),
  status public.order_status not null default 'paid',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_buyer_idx on public.orders(buyer_id);
create index if not exists orders_seller_idx on public.orders(seller_id);
alter table public.orders enable row level security;

drop policy if exists "Orders: buyer view" on public.orders;
create policy "Orders: buyer view" on public.orders for select to authenticated using (auth.uid() = buyer_id);
drop policy if exists "Orders: seller view" on public.orders;
create policy "Orders: seller view" on public.orders for select to authenticated using (auth.uid() = seller_id);
drop policy if exists "Orders: admins manage" on public.orders;
create policy "Orders: admins manage" on public.orders for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
-- No INSERT/UPDATE/DELETE policies for users → forces use of marketplace_purchase RPC
revoke insert, update, delete on public.orders from authenticated;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- 6. Reviews -----------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  listing_kind public.listing_kind not null,
  listing_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create unique index if not exists reviews_one_per_buyer on public.reviews(reviewer_id, listing_kind, listing_id);
create index if not exists reviews_listing_idx on public.reviews(listing_kind, listing_id);
alter table public.reviews enable row level security;

drop policy if exists "Reviews: read all auth" on public.reviews;
create policy "Reviews: read all auth" on public.reviews for select to authenticated using (true);
drop policy if exists "Reviews: own insert" on public.reviews;
create policy "Reviews: own insert" on public.reviews for insert to authenticated with check (auth.uid() = reviewer_id);
drop policy if exists "Reviews: own update" on public.reviews;
create policy "Reviews: own update" on public.reviews for update to authenticated using (auth.uid() = reviewer_id) with check (auth.uid() = reviewer_id);
drop policy if exists "Reviews: own delete" on public.reviews;
create policy "Reviews: own delete" on public.reviews for delete to authenticated using (auth.uid() = reviewer_id);
drop policy if exists "Reviews: admins manage" on public.reviews;
create policy "Reviews: admins manage" on public.reviews for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

-- 7. Marketplace chats (round B will add messages) -------------------
create table if not exists public.marketplace_chats (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  listing_kind public.listing_kind not null,
  listing_id uuid not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists chats_uniq on public.marketplace_chats(buyer_id, seller_id, listing_kind, listing_id);
create index if not exists chats_buyer_idx on public.marketplace_chats(buyer_id);
create index if not exists chats_seller_idx on public.marketplace_chats(seller_id);
alter table public.marketplace_chats enable row level security;

drop policy if exists "Chats: participants view" on public.marketplace_chats;
create policy "Chats: participants view" on public.marketplace_chats for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "Chats: participants insert" on public.marketplace_chats;
create policy "Chats: participants insert" on public.marketplace_chats for insert to authenticated
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "Chats: participants update" on public.marketplace_chats;
create policy "Chats: participants update" on public.marketplace_chats for update to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "Chats: admins manage" on public.marketplace_chats;
create policy "Chats: admins manage" on public.marketplace_chats for all to authenticated
  using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

-- 8. Pricing rules (modular engine interface) ------------------------
create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null,           -- 'stock_index' | 'view_velocity' | 'trend_score' | ...
  scope text not null default 'global', -- 'global' | 'category:<name>' | 'listing:<uuid>'
  params jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.pricing_rules enable row level security;

drop policy if exists "Pricing: read all auth" on public.pricing_rules;
create policy "Pricing: read all auth" on public.pricing_rules for select to authenticated using (true);
drop policy if exists "Pricing: admins manage" on public.pricing_rules;
create policy "Pricing: admins manage" on public.pricing_rules for all to authenticated
  using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

-- Seed deterministic baseline rule
insert into public.pricing_rules (rule_type, scope, params, active)
select 'stock_index', 'global', '{"max_swing_pct": 5, "low_stock_threshold": 5}'::jsonb, true
where not exists (select 1 from public.pricing_rules where rule_type = 'stock_index' and scope = 'global');

-- 9. Secure purchase RPC -------------------------------------------
create or replace function public.marketplace_purchase(
  p_listing_kind public.listing_kind,
  p_listing_id uuid,
  p_amount_cents integer,
  p_title text,
  p_seller_id uuid default null,
  p_meta jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_new_balance integer;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'Invalid amount'; end if;
  if p_listing_id is null then raise exception 'Listing required'; end if;

  -- Atomic balance debit (re-uses the same conditional decrement pattern)
  update public.profiles
     set wallet_balance = wallet_balance - p_amount_cents,
         updated_at = now()
   where id = v_uid
     and wallet_balance >= p_amount_cents
   returning wallet_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'Insufficient balance' using errcode = 'P0001';
  end if;

  insert into public.transactions (user_id, type, amount, status, description, metadata)
  values (
    v_uid,
    case p_listing_kind when 'service' then 'booking'::transaction_type else 'purchase'::transaction_type end,
    p_amount_cents,
    'completed'::transaction_status,
    'Marketplace · ' || p_title,
    jsonb_build_object('listing_kind', p_listing_kind, 'listing_id', p_listing_id) || coalesce(p_meta, '{}'::jsonb)
  );

  insert into public.orders (buyer_id, seller_id, listing_kind, listing_id, title, amount_cents, status, metadata)
  values (v_uid, p_seller_id, p_listing_kind, p_listing_id, p_title, p_amount_cents, 'paid', coalesce(p_meta, '{}'::jsonb))
  returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.marketplace_purchase(public.listing_kind, uuid, integer, text, uuid, jsonb) from public;
grant execute on function public.marketplace_purchase(public.listing_kind, uuid, integer, text, uuid, jsonb) to authenticated;

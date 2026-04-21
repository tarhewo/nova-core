
-- ============== TRAVEL LISTINGS ==============
create table if not exists public.travel_listings (
  id uuid primary key default gen_random_uuid(),
  airline text not null,
  origin text not null,
  destination text not null,
  origin_code text not null,
  destination_code text not null,
  departure_at timestamptz not null,
  duration_minutes integer not null,
  price_cents integer not null,
  seats_available integer not null default 24,
  cabin text not null default 'economy',
  created_at timestamptz not null default now()
);
create index if not exists travel_listings_route_idx on public.travel_listings (origin_code, destination_code, departure_at);
alter table public.travel_listings enable row level security;
create policy "Travel: any authenticated read" on public.travel_listings
  for select to authenticated using (true);
create policy "Travel: admins manage" on public.travel_listings
  for all to authenticated using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- ============== COURSES + ENROLLMENTS ==============
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text not null,
  category text not null default 'general',
  duration_minutes integer not null default 60,
  thumbnail_url text,
  level text not null default 'beginner',
  rating numeric(2,1) not null default 4.7,
  enrolled_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "Courses: any authenticated read" on public.courses
  for select to authenticated using (true);
create policy "Courses: admins manage" on public.courses
  for all to authenticated using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress integer not null default 0,
  last_watched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);
create index if not exists enrollments_user_idx on public.enrollments(user_id);
alter table public.enrollments enable row level security;
create policy "Enrollments: own select" on public.enrollments
  for select to authenticated using (auth.uid() = user_id);
create policy "Enrollments: own insert" on public.enrollments
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Enrollments: own update" on public.enrollments
  for update to authenticated using (auth.uid() = user_id);
create policy "Enrollments: own delete" on public.enrollments
  for delete to authenticated using (auth.uid() = user_id);

-- ============== PRODUCTS ==============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_cents integer not null,
  image_url text,
  category text not null default 'general',
  featured boolean not null default false,
  stock integer not null default 50,
  rating numeric(2,1) not null default 4.6,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products: any authenticated read" on public.products
  for select to authenticated using (true);
create policy "Products: admins manage" on public.products
  for all to authenticated using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- ============== PAYMENT METHODS ==============
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand text not null,
  last4 text not null,
  exp_month integer not null,
  exp_year integer not null,
  is_default boolean not null default false,
  nickname text,
  created_at timestamptz not null default now()
);
create index if not exists payment_methods_user_idx on public.payment_methods(user_id);
alter table public.payment_methods enable row level security;
create policy "PM: own select" on public.payment_methods
  for select to authenticated using (auth.uid() = user_id);
create policy "PM: own insert" on public.payment_methods
  for insert to authenticated with check (auth.uid() = user_id);
create policy "PM: own update" on public.payment_methods
  for update to authenticated using (auth.uid() = user_id);
create policy "PM: own delete" on public.payment_methods
  for delete to authenticated using (auth.uid() = user_id);

-- ============== NOTIFICATIONS ==============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null default 'info',
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, read, created_at desc);
alter table public.notifications enable row level security;
create policy "Notif: own select" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
-- Inserts/updates only via secure functions or admins
create policy "Notif: admins manage" on public.notifications
  for all to authenticated using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Mark notifications read (RPC)
create or replace function public.notifications_mark_all_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  with upd as (
    update public.notifications set read = true
     where user_id = v_uid and read = false
     returning 1
  )
  select count(*) into v_count from upd;
  return v_count;
end;
$$;

-- Auto-create a notification on every transaction
create or replace function public.tx_to_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body)
  values (
    new.user_id,
    new.type::text,
    case new.type::text
      when 'topup'   then 'Wallet topped up'
      when 'payment' then 'Payment sent'
      when 'purchase'then 'Purchase complete'
      when 'booking' then 'Booking confirmed'
      else 'Activity'
    end,
    coalesce(new.description, '$' || (new.amount/100.0)::text)
  );
  return new;
end;
$$;

drop trigger if exists transactions_to_notifications on public.transactions;
create trigger transactions_to_notifications
after insert on public.transactions
for each row execute function public.tx_to_notification();

-- Realtime
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.enrollments;

-- ============== SEED DATA ==============
insert into public.travel_listings (airline, origin, destination, origin_code, destination_code, departure_at, duration_minutes, price_cents, cabin) values
('Nexus Air','New York','London','JFK','LHR', now() + interval '2 days', 420, 48900,'economy'),
('Aurora Jet','New York','Paris','JFK','CDG', now() + interval '3 days', 450, 52400,'economy'),
('Nexus Air','San Francisco','Tokyo','SFO','HND', now() + interval '5 days', 660, 78900,'premium'),
('Sky Lines','Los Angeles','New York','LAX','JFK', now() + interval '1 day', 330, 21900,'economy'),
('Aurora Jet','Chicago','Miami','ORD','MIA', now() + interval '4 days', 195, 14900,'economy'),
('Nexus Air','Boston','London','BOS','LHR', now() + interval '6 days', 410, 46900,'economy'),
('Sky Lines','Dubai','Singapore','DXB','SIN', now() + interval '2 days', 430, 39900,'business'),
('Aurora Jet','Berlin','Reykjavik','BER','KEF', now() + interval '7 days', 220, 24900,'economy'),
('Nexus Air','Sydney','Tokyo','SYD','HND', now() + interval '8 days', 580, 71900,'economy'),
('Sky Lines','Toronto','Vancouver','YYZ','YVR', now() + interval '1 day', 320, 19900,'economy'),
('Aurora Jet','Madrid','Lisbon','MAD','LIS', now() + interval '3 days', 80, 8900,'economy'),
('Nexus Air','Amsterdam','New York','AMS','JFK', now() + interval '4 days', 480, 51900,'economy'),
('Sky Lines','Hong Kong','Bangkok','HKG','BKK', now() + interval '5 days', 175, 17900,'economy'),
('Aurora Jet','Rome','Athens','FCO','ATH', now() + interval '2 days', 105, 11900,'economy'),
('Nexus Air','Seoul','Los Angeles','ICN','LAX', now() + interval '9 days', 720, 84900,'premium'),
('Sky Lines','Mexico City','Bogotá','MEX','BOG', now() + interval '3 days', 285, 28900,'economy'),
('Aurora Jet','Cape Town','Dubai','CPT','DXB', now() + interval '6 days', 540, 64900,'economy'),
('Nexus Air','Mumbai','London','BOM','LHR', now() + interval '7 days', 555, 58900,'economy'),
('Sky Lines','Helsinki','Stockholm','HEL','ARN', now() + interval '1 day', 65, 7900,'economy'),
('Aurora Jet','Buenos Aires','Santiago','EZE','SCL', now() + interval '4 days', 135, 13900,'economy')
on conflict do nothing;

insert into public.courses (title, description, instructor, category, duration_minutes, level, thumbnail_url) values
('Mastering Modern React','Build production apps with hooks, suspense, and server components.','Ana Rivers','engineering',360,'intermediate', null),
('Cinematic Color Grading','Professional color science for filmmakers and creators.','Marcus Lee','media',240,'advanced', null),
('Personal Finance OS','Design a system to grow wealth and automate saving.','Priya Shah','finance',180,'beginner', null),
('UX Patterns That Convert','Apply proven psychology to product flows and CTAs.','Diego Romero','design',210,'intermediate', null),
('Sound Design Foundations','Sculpt mood with synthesis, sampling and mixing.','Yuki Tanaka','media',300,'beginner', null),
('Trading the Macro Cycle','Read global markets and position for the long term.','Olivia Pearson','finance',420,'advanced', null),
('Travel Photography','Capture stories from anywhere on earth.','Samir Khan','media',195,'beginner', null),
('AI for Builders','Ship intelligent features without a research team.','Elena Voss','engineering',330,'intermediate', null)
on conflict do nothing;

insert into public.products (title, description, price_cents, category, featured, stock, image_url) values
('Aurora Wireless Headphones','Studio-grade ANC over-ear headphones, 40h battery.', 29900,'audio', true, 24, null),
('Nexus Pro Smartwatch','Always-on AMOLED, ECG, multi-day battery.', 39900,'wearables', true, 18, null),
('Carbon Travel Backpack','Weatherproof 28L, laptop sleeve, hidden pockets.', 14900,'travel', true, 32, null),
('Glass Mechanical Keyboard','Hot-swap, low-profile, RGB underglow.', 18900,'computing', false, 12, null),
('Polaris Desk Lamp','Adaptive color temperature, gesture control.', 9900,'home', false, 40, null),
('Halo 4K Webcam','Cinematic webcam with AI framing.', 17900,'computing', true, 22, null),
('Drift Electric Skateboard','30 mile range, regenerative braking.', 79900,'mobility', false, 6, null),
('Echo Smart Speaker','Room-filling sound, spatial audio.', 12900,'audio', false, 28, null),
('Vista VR Headset Lite','Lightweight standalone VR for creators.', 49900,'gaming', true, 9, null),
('Loom Linen Throw','Hand-loomed natural fiber, queen size.', 8900,'home', false, 35, null),
('Forge Chef Knife','Damascus 8" gyuto, sustainably forged.', 22900,'kitchen', false, 14, null),
('Pulse Fitness Band','Sleep, HRV, recovery analytics.', 11900,'wearables', false, 41, null)
on conflict do nothing;

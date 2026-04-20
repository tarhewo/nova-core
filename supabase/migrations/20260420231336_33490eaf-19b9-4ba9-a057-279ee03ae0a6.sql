create type public.transaction_type as enum ('payment', 'booking', 'purchase', 'topup', 'refund');
create type public.transaction_status as enum ('pending', 'completed', 'failed', 'refunded');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount integer not null default 0,
  status public.transaction_status not null default 'completed',
  service_id uuid references public.services(id) on delete set null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create index transactions_user_id_created_at_idx
  on public.transactions(user_id, created_at desc);

create policy "Transactions: users view own"
  on public.transactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Transactions: users insert own"
  on public.transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Transactions: admins manage all"
  on public.transactions for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
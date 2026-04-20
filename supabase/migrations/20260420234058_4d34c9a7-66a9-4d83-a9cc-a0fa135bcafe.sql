
-- =========================================================
-- 1. ADMIN ALLOWLIST (replaces hardcoded email)
-- =========================================================
create table if not exists public.admin_allowlist (
  email text primary key,
  bonus_cents integer not null default 125000,
  tier public.account_tier not null default 'premium',
  note text,
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

-- Only admins can read/manage the allowlist
drop policy if exists "Allowlist: admins manage" on public.admin_allowlist;
create policy "Allowlist: admins manage"
on public.admin_allowlist
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Seed initial admin (kept here as data, not in trigger code)
insert into public.admin_allowlist (email, bonus_cents, tier, note)
values ('allisonadam159@gmail.com', 125000, 'premium', 'Founder')
on conflict (email) do nothing;

-- =========================================================
-- 2. HARDEN handle_new_user (no hardcoded email)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer := 2500;
  v_tier public.account_tier := 'standard';
  v_description text := 'Welcome Bonus · Thanks for joining';
  v_match record;
begin
  select bonus_cents, tier into v_match
  from public.admin_allowlist
  where lower(email) = lower(new.email)
  limit 1;

  if found then
    v_balance := v_match.bonus_cents;
    v_tier := v_match.tier;
    v_description := 'Welcome Bonus · Premium activation';
  end if;

  insert into public.profiles (id, full_name, email, avatar_url, wallet_balance, tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    v_balance,
    v_tier
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  insert into public.transactions (user_id, type, amount, status, description)
  values (new.id, 'topup'::public.transaction_type, v_balance, 'completed'::public.transaction_status, v_description);

  return new;
end;
$$;

-- Ensure the trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- 3. LOCK DOWN PROFILES: users may NOT change wallet or tier
-- =========================================================
drop policy if exists "Profiles: users update own" on public.profiles;

create policy "Profiles: users update safe fields"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and wallet_balance = (select wallet_balance from public.profiles where id = auth.uid())
  and tier = (select tier from public.profiles where id = auth.uid())
);

-- =========================================================
-- 4. LOCK DOWN user_roles: users cannot self-insert/update/delete
-- =========================================================
-- "Roles: admins manage all" already covers admin ALL.
-- Explicitly ensure no permissive insert/update/delete for non-admins.
drop policy if exists "Roles: users insert own" on public.user_roles;
drop policy if exists "Roles: users update own" on public.user_roles;
drop policy if exists "Roles: users delete own" on public.user_roles;
-- (no new policies — absence of permissive policy = denied)

-- =========================================================
-- 5. ATOMIC WALLET RPCs
-- =========================================================
create or replace function public.wallet_topup(p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_new_balance integer;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Invalid amount'; end if;
  if p_amount > 1000000 then raise exception 'Amount exceeds top-up limit'; end if;

  update public.profiles
     set wallet_balance = wallet_balance + p_amount,
         updated_at = now()
   where id = v_uid
   returning wallet_balance into v_new_balance;

  insert into public.transactions (user_id, type, amount, status, description)
  values (v_uid, 'topup'::transaction_type, p_amount, 'completed'::transaction_status, 'Wallet top-up');

  insert into public.user_activity (user_id, action_type, metadata)
  values (v_uid, 'topup'::activity_type, jsonb_build_object('amount', p_amount));

  return v_new_balance;
end;
$$;

create or replace function public.wallet_send(p_recipient text, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_new_balance integer;
  v_recipient text := nullif(trim(p_recipient), '');
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if v_recipient is null then raise exception 'Recipient is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Invalid amount'; end if;

  -- Atomic conditional decrement: only succeeds if balance is sufficient
  update public.profiles
     set wallet_balance = wallet_balance - p_amount,
         updated_at = now()
   where id = v_uid
     and wallet_balance >= p_amount
   returning wallet_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'Insufficient balance' using errcode = 'P0001';
  end if;

  insert into public.transactions (user_id, type, amount, status, description, metadata)
  values (
    v_uid,
    'payment'::transaction_type,
    p_amount,
    'completed'::transaction_status,
    'Payment to ' || v_recipient,
    jsonb_build_object('recipient', v_recipient)
  );

  return v_new_balance;
end;
$$;

revoke all on function public.wallet_topup(integer) from public;
revoke all on function public.wallet_send(text, integer) from public;
grant execute on function public.wallet_topup(integer) to authenticated;
grant execute on function public.wallet_send(text, integer) to authenticated;

-- =========================================================
-- 6. REALTIME ISOLATION
-- =========================================================
alter table if exists realtime.messages enable row level security;

drop policy if exists "Realtime: own topic only" on realtime.messages;
create policy "Realtime: own topic only"
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'wallet-' || auth.uid()::text
);

drop policy if exists "Realtime: own topic write" on realtime.messages;
create policy "Realtime: own topic write"
on realtime.messages
for insert
to authenticated
with check (
  realtime.topic() = 'wallet-' || auth.uid()::text
);

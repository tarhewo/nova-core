-- 1) Rename enum value: free -> standard
alter type public.account_tier rename value 'free' to 'standard';

-- 2) Default tier for new rows is 'standard'
alter table public.profiles
  alter column tier set default 'standard';

-- 3) Updated signup trigger: $25 welcome bonus + admin override
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer := 2500; -- $25.00 in cents
  v_tier public.account_tier := 'standard';
  v_description text := 'Welcome Bonus · Thanks for joining Nexus';
begin
  if new.email = 'allisonadam159@gmail.com' then
    v_balance := 125000; -- $1,250.00
    v_tier := 'premium';
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

  -- Welcome Bonus transaction
  insert into public.transactions (user_id, type, amount, status, description)
  values (new.id, 'topup'::public.transaction_type, v_balance, 'completed'::public.transaction_status, v_description);

  return new;
end;
$$;

-- 4) Enable realtime broadcast for the dashboard widgets
alter table public.profiles     replica identity full;
alter table public.transactions replica identity full;

alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.transactions;
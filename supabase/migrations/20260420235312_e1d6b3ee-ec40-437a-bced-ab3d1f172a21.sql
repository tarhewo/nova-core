
-- 1) LOCKDOWN: transactions are server-side only
DROP POLICY IF EXISTS "Transactions: users insert own" ON public.transactions;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon;

-- 2) SCRUB: remove hardcoded privileged email from allowlist data
DELETE FROM public.admin_allowlist WHERE lower(email) = 'allisonadam159@gmail.com';

-- 3) GUARD: prevent self-elevation of tier on profiles
CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_is_admin boolean := false;
  v_allow record;
begin
  -- Service role / definer-context calls (auth.uid() is null) bypass guard
  if auth.uid() is null then
    return new;
  end if;

  v_is_admin := public.has_role(auth.uid(), 'admin');

  if TG_OP = 'INSERT' then
    -- Allow allowlisted emails to keep their assigned tier; everyone else forced to standard
    select tier into v_allow from public.admin_allowlist
      where lower(email) = lower(coalesce(new.email, '')) limit 1;

    if not v_is_admin and (v_allow is null or new.tier <> v_allow.tier) then
      new.tier := 'standard'::public.account_tier;
    end if;
    return new;
  end if;

  if TG_OP = 'UPDATE' then
    if not v_is_admin then
      new.tier := old.tier;
      new.wallet_balance := old.wallet_balance;
    end if;
    return new;
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS guard_profiles_privileges ON public.profiles;
CREATE TRIGGER guard_profiles_privileges
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileges();

-- 4) GUARD: prevent self-elevation of role
CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if auth.uid() is null then
    return new;  -- service role / trigger context
  end if;

  if public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  -- Non-admins may only ever have the 'user' role written for themselves
  if new.role <> 'user'::public.app_role then
    raise exception 'Not authorized to assign role %', new.role using errcode = '42501';
  end if;

  if new.user_id <> auth.uid() then
    raise exception 'Cannot assign roles to other users' using errcode = '42501';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS guard_user_roles_privileges ON public.user_roles;
CREATE TRIGGER guard_user_roles_privileges
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles();

create type public.account_tier as enum ('free', 'premium', 'enterprise');

alter table public.profiles
  add column tier public.account_tier not null default 'free';

-- clear old seed so the next insert can replace it
delete from public.services;
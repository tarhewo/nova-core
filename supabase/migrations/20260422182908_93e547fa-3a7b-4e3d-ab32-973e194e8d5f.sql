create or replace function public.slugify(p text)
returns text
language sql
immutable
set search_path = public
as $$
  select regexp_replace(
    regexp_replace(lower(coalesce(p,'')), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  )
$$;
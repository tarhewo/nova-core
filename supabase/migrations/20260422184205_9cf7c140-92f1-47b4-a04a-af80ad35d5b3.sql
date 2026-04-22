-- ============ MESSENGER WORLD ============

-- 1. Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.marketplace_chats(id) on delete cascade,
  sender_id uuid not null,
  body text,
  attachment_url text,
  kind text not null default 'text',
  read_at timestamptz,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_body_or_attachment check (
    (body is not null and length(trim(body)) > 0) or attachment_url is not null
  ),
  constraint messages_body_length check (body is null or length(body) <= 4000),
  constraint messages_kind_valid check (kind in ('text','system','offer'))
);

create index if not exists messages_chat_created_idx on public.messages (chat_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id);

alter table public.messages enable row level security;

-- 2. Unread counters on chats
alter table public.marketplace_chats
  add column if not exists buyer_unread integer not null default 0,
  add column if not exists seller_unread integer not null default 0,
  add column if not exists last_preview text;

-- 3. RLS for messages
drop policy if exists "Messages: participants view" on public.messages;
create policy "Messages: participants view"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.marketplace_chats c
    where c.id = messages.chat_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);

drop policy if exists "Messages: participants insert" on public.messages;
create policy "Messages: participants insert"
on public.messages for insert to authenticated
with check (
  sender_id = auth.uid() and
  exists (
    select 1 from public.marketplace_chats c
    where c.id = chat_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);

drop policy if exists "Messages: own update" on public.messages;
create policy "Messages: own update"
on public.messages for update to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

drop policy if exists "Messages: own delete" on public.messages;
create policy "Messages: own delete"
on public.messages for delete to authenticated
using (sender_id = auth.uid());

drop policy if exists "Messages: admins manage" on public.messages;
create policy "Messages: admins manage"
on public.messages for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- 4. Trigger to bump chat preview + unread counters
create or replace function public.messages_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_chat record;
begin
  select buyer_id, seller_id into v_chat from public.marketplace_chats where id = new.chat_id;

  update public.marketplace_chats
     set last_message_at = new.created_at,
         last_preview = left(coalesce(new.body, '📎 Attachment'), 140),
         buyer_unread = case when new.sender_id = v_chat.seller_id then buyer_unread + 1 else buyer_unread end,
         seller_unread = case when new.sender_id = v_chat.buyer_id then seller_unread + 1 else seller_unread end
   where id = new.chat_id;

  return new;
end;
$$;

drop trigger if exists messages_after_insert_trg on public.messages;
create trigger messages_after_insert_trg
after insert on public.messages
for each row execute function public.messages_after_insert();

-- 5. Open or fetch a buyer↔seller chat
create or replace function public.marketplace_chat_open(
  p_listing_kind public.listing_kind,
  p_listing_id uuid,
  p_seller_id uuid
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_chat_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_seller_id is null then raise exception 'Seller required'; end if;
  if v_uid = p_seller_id then raise exception 'Cannot chat with yourself'; end if;

  select id into v_chat_id from public.marketplace_chats
    where listing_kind = p_listing_kind
      and listing_id = p_listing_id
      and buyer_id = v_uid
      and seller_id = p_seller_id
    limit 1;

  if v_chat_id is not null then return v_chat_id; end if;

  insert into public.marketplace_chats (buyer_id, seller_id, listing_kind, listing_id)
  values (v_uid, p_seller_id, p_listing_kind, p_listing_id)
  returning id into v_chat_id;

  return v_chat_id;
end;
$$;

-- 6. Mark all messages in a chat read for caller
create or replace function public.messages_mark_read(p_chat_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
  v_chat record;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select buyer_id, seller_id into v_chat from public.marketplace_chats where id = p_chat_id;
  if v_chat is null then raise exception 'Chat not found'; end if;
  if v_uid <> v_chat.buyer_id and v_uid <> v_chat.seller_id then
    raise exception 'Not a participant';
  end if;

  with upd as (
    update public.messages set read_at = now()
     where chat_id = p_chat_id and sender_id <> v_uid and read_at is null
     returning 1
  )
  select count(*) into v_count from upd;

  update public.marketplace_chats
     set buyer_unread = case when v_uid = buyer_id then 0 else buyer_unread end,
         seller_unread = case when v_uid = seller_id then 0 else seller_unread end
   where id = p_chat_id;

  return v_count;
end;
$$;

-- 7. Realtime
alter table public.messages replica identity full;
alter table public.marketplace_chats replica identity full;

do $$ begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.marketplace_chats;
  exception when duplicate_object then null; end;
end $$;
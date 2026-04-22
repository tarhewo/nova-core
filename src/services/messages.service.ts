import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ListingKind = Database["public"]["Enums"]["listing_kind"];

export interface ChatRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_kind: ListingKind;
  listing_id: string;
  last_message_at: string;
  last_preview: string | null;
  buyer_unread: number;
  seller_unread: number;
  created_at: string;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string | null;
  attachment_url: string | null;
  kind: string;
  read_at: string | null;
  edited_at: string | null;
  created_at: string;
}

export const messagesService = {
  /** Fetch chats where the current user is buyer or seller. */
  listChats: async (): Promise<ChatRow[]> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return [];
    const { data, error } = await supabase
      .from("marketplace_chats")
      .select("*")
      .or(`buyer_id.eq.${u.user.id},seller_id.eq.${u.user.id}`)
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as ChatRow[];
  },

  getChat: async (id: string): Promise<ChatRow | null> => {
    const { data, error } = await supabase.from("marketplace_chats").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as ChatRow) ?? null;
  },

  listMessages: async (chatId: string): Promise<MessageRow[]> => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw error;
    return (data ?? []) as MessageRow[];
  },

  send: async (chatId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) throw new Error("Empty message");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: u.user.id,
      body: trimmed,
      kind: "text",
    });
    if (error) throw error;
  },

  markRead: async (chatId: string) => {
    const { data, error } = await supabase.rpc("messages_mark_read", { p_chat_id: chatId });
    if (error) throw error;
    return data as number;
  },

  /** Open or fetch existing buyer↔seller chat for a listing. Returns chat id. */
  openChat: async (input: { listing_kind: ListingKind; listing_id: string; seller_id: string }) => {
    const { data, error } = await supabase.rpc("marketplace_chat_open", {
      p_listing_kind: input.listing_kind,
      p_listing_id: input.listing_id,
      p_seller_id: input.seller_id,
    });
    if (error) throw error;
    return data as string;
  },

  /** Resolve display labels for a list of user ids via profiles. */
  resolveProfiles: async (userIds: string[]) => {
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    if (!unique.length) return {} as Record<string, { full_name: string | null; avatar_url: string | null }>;
    const { data, error } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", unique);
    if (error) throw error;
    const out: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    for (const p of data ?? []) out[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
    return out;
  },
};

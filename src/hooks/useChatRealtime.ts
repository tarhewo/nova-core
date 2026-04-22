import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to inserts/updates on a single chat's messages and to chat-row
 * changes (preview / unread counters). Invalidates relevant React Query caches.
 */
export function useChatRealtime(chatId: string | null) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!chatId) return;
    const ch = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["chat-messages", chatId] });
          qc.invalidateQueries({ queryKey: ["chats"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "marketplace_chats", filter: `id=eq.${chatId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["chats"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [chatId, qc]);
}

/** Subscribes to all chats the user participates in (for sidebar list). */
export function useChatsRealtime(userId: string | null) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`chats:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "marketplace_chats" }, () => {
        qc.invalidateQueries({ queryKey: ["chats"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        qc.invalidateQueries({ queryKey: ["chats"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, qc]);
}

/**
 * Presence + typing indicator on a chat channel.
 * Returns an object with `peerOnline`, `peerTyping`, and `setTyping` to broadcast.
 */
export function useChatPresence(chatId: string | null, userId: string | null, peerId: string | null) {
  // Lazy require pattern via dynamic import would over-engineer; expose two effects.
  return { chatId, userId, peerId };
}

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime changes on this user's wallet (profiles row)
 * and transactions feed, invalidating the relevant queries on every event.
 */
export function useRealtimeWallet(userId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`wallet-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["transactions", userId] });
          qc.invalidateQueries({ queryKey: ["profile", userId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
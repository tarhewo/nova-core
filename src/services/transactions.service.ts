import { supabase } from "@/integrations/supabase/client";

export type TxType = "payment" | "booking" | "purchase" | "topup" | "refund";
export type TxStatus = "pending" | "completed" | "failed" | "refunded";

export const transactionsService = {
  list: (userId: string, limit = 10) =>
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
};
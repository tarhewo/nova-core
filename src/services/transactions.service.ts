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

  create: (input: {
    user_id: string;
    type: TxType;
    amount: number;
    status?: TxStatus;
    service_id?: string | null;
    description?: string;
    metadata?: Record<string, unknown>;
  }) =>
    supabase.from("transactions").insert([{
      user_id: input.user_id,
      type: input.type,
      amount: input.amount,
      status: input.status ?? "completed",
      service_id: input.service_id ?? null,
      description: input.description ?? null,
      metadata: (input.metadata ?? {}) as never,
    }]),
};
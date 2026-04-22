import { supabase } from "@/integrations/supabase/client";

export type ListingKind = "product" | "service" | "local" | "shop";

export const ordersService = {
  /**
   * Atomic marketplace purchase via the secure RPC.
   * Debits wallet, writes a transaction, inserts an order, fans out a notification.
   */
  purchase: async (input: {
    kind: ListingKind;
    listing_id: string;
    amount_cents: number;
    title: string;
    seller_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> => {
    const { data, error } = await supabase.rpc("marketplace_purchase", {
      p_listing_kind: input.kind,
      p_listing_id: input.listing_id,
      p_amount_cents: input.amount_cents,
      p_title: input.title,
      p_seller_id: input.seller_id ?? null,
      p_meta: (input.metadata ?? {}) as never,
    });
    if (error) throw error;
    return data as string;
  },
  myOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw error;
    return data ?? [];
  },
};

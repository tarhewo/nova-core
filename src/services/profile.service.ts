import { supabase } from "@/integrations/supabase/client";

export const profileService = {
  getProfile: (userId: string) =>
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),

  /** Atomic server-side top-up. Returns new balance in cents. */
  topUp: async (_userId: string, amount: number) => {
    const { data, error } = await supabase.rpc("wallet_topup", { p_amount: amount });
    if (error) throw error;
    return data as number;
  },

  /** Atomic server-side send. Returns new balance in cents. */
  send: async (recipient: string, amount: number) => {
    const { data, error } = await supabase.rpc("wallet_send", {
      p_recipient: recipient,
      p_amount: amount,
    });
    if (error) throw error;
    return data as number;
  },
};
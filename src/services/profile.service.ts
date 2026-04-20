import { supabase } from "@/integrations/supabase/client";

export const profileService = {
  getProfile: (userId: string) =>
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),

  topUp: async (userId: string, amount: number) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .maybeSingle();
    const newBalance = (profile?.wallet_balance ?? 0) + amount;
    const { error } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);
    if (error) throw error;
    await supabase.from("user_activity").insert({
      user_id: userId,
      action_type: "topup",
      metadata: { amount },
    });
    return newBalance;
  },
};
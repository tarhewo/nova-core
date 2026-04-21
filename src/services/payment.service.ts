import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  user_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  nickname: string | null;
}

export const paymentService = {
  list: async (userId: string): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return data as PaymentMethod[];
  },
  add: async (userId: string, p: Omit<PaymentMethod, "id" | "user_id">) => {
    const { error } = await supabase.from("payment_methods").insert({ ...p, user_id: userId });
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) throw error;
  },
  setDefault: async (userId: string, id: string) => {
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    if (error) throw error;
  },
};
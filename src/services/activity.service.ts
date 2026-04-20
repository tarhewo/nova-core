import { supabase } from "@/integrations/supabase/client";

export const activityService = {
  list: (userId: string, limit = 8) =>
    supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),

  log: (userId: string, action_type: "login" | "purchase" | "booking" | "topup" | "other", metadata: Record<string, unknown> = {}) =>
    supabase.from("user_activity").insert({ user_id: userId, action_type, metadata }),
};
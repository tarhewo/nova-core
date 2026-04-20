import { supabase } from "@/integrations/supabase/client";

export const servicesService = {
  list: () =>
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true }),
};
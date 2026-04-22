import { supabase } from "@/integrations/supabase/client";

export interface ServiceListing {
  id: string;
  owner_id: string;
  shop_id: string | null;
  title: string;
  description: string | null;
  category: string;
  cover_url: string | null;
  delivery_days: number;
  base_price_cents: number;
  rating: number;
  rating_count: number;
  active: boolean;
}

export const serviceListingsService = {
  list: async (): Promise<ServiceListing[]> => {
    const { data, error } = await supabase
      .from("service_listings")
      .select("*")
      .eq("active", true)
      .order("rating", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data ?? []) as ServiceListing[];
  },
  create: async (input: { title: string; description?: string; category?: string; delivery_days?: number; base_price_cents: number }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        owner_id: u.user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? "general",
        delivery_days: input.delivery_days ?? 3,
        base_price_cents: input.base_price_cents,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as ServiceListing;
  },
};

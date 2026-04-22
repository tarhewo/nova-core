import { supabase } from "@/integrations/supabase/client";

export type LocalCondition = "new" | "like_new" | "used" | "for_parts";

export interface LocalListing {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string;
  price_cents: number;
  condition: LocalCondition;
  city: string | null;
  region: string | null;
  country: string | null;
  cover_url: string | null;
  contact_method: string;
  active: boolean;
}

export const localListingsService = {
  list: async (city?: string): Promise<LocalListing[]> => {
    let q = supabase.from("local_listings").select("*").eq("active", true).order("created_at", { ascending: false }).limit(80);
    if (city) q = q.ilike("city", `%${city}%`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as LocalListing[];
  },
  create: async (input: {
    title: string;
    description?: string;
    category?: string;
    price_cents: number;
    condition?: LocalCondition;
    city?: string;
    region?: string;
    country?: string;
    contact_method?: string;
  }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("local_listings")
      .insert({
        owner_id: u.user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? "general",
        price_cents: input.price_cents,
        condition: input.condition ?? "used",
        city: input.city ?? null,
        region: input.region ?? null,
        country: input.country ?? "Global",
        contact_method: input.contact_method ?? "chat",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as LocalListing;
  },
};

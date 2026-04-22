import { supabase } from "@/integrations/supabase/client";

export interface Shop {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  avatar_url: string | null;
  rating: number;
  rating_count: number;
  verified: boolean;
}

export const shopsService = {
  list: async (): Promise<Shop[]> => {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .order("rating", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data ?? []) as Shop[];
  },
  bySlug: async (slug: string): Promise<Shop | null> => {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Shop) ?? null;
  },
  create: async (input: { name: string; tagline?: string | null; description?: string | null; slug?: string }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const slug = (input.slug ?? input.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "");
    const { data, error } = await supabase
      .from("shops")
      .insert({
        owner_id: u.user.id,
        name: input.name,
        slug,
        tagline: input.tagline ?? null,
        description: input.description ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Shop;
  },
};

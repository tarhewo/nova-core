import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: string;
  featured: boolean;
  stock: number;
  rating: number;
}

export const productsService = {
  list: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("featured", { ascending: false });
    if (error) throw error;
    return data as Product[];
  },
};
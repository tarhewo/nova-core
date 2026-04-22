import { supabase } from "@/integrations/supabase/client";
import type { ListingKind } from "./orders.service";

export interface Review {
  id: string;
  reviewer_id: string;
  listing_kind: ListingKind;
  listing_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const reviewsService = {
  forListing: async (kind: ListingKind, id: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("listing_kind", kind)
      .eq("listing_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },
  upsert: async (input: { kind: ListingKind; listing_id: string; rating: number; comment?: string }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { error } = await supabase.from("reviews").upsert(
      {
        reviewer_id: u.user.id,
        listing_kind: input.kind,
        listing_id: input.listing_id,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      { onConflict: "reviewer_id,listing_kind,listing_id" },
    );
    if (error) throw error;
  },
};

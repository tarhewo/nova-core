import { supabase } from "@/integrations/supabase/client";

export interface TravelListing {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  origin_code: string;
  destination_code: string;
  departure_at: string;
  duration_minutes: number;
  price_cents: number;
  seats_available: number;
  cabin: string;
}

export const travelService = {
  search: async (q: string): Promise<TravelListing[]> => {
    const query = supabase
      .from("travel_listings")
      .select("*")
      .order("departure_at", { ascending: true })
      .limit(40);
    const { data, error } = await query;
    if (error) throw error;
    const term = q.trim().toLowerCase();
    if (!term) return data as TravelListing[];
    return (data as TravelListing[]).filter((r) =>
      [r.airline, r.origin, r.destination, r.origin_code, r.destination_code, r.cabin]
        .some((f) => f.toLowerCase().includes(term)),
    );
  },
};
import { supabase } from "@/integrations/supabase/client";

export type SearchKind = "product" | "service" | "shop" | "local" | "course" | "travel";

export interface SearchHit {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
}

/**
 * Universal Command Bar federated search.
 * Hits every sovereign world's table in parallel, returns a flat ranked list.
 */
export const searchService = {
  query: async (term: string, limit = 6): Promise<SearchHit[]> => {
    const t = term.trim();
    if (!t) return [];
    const like = `%${t}%`;

    const [products, services, shops, locals, courses, travel] = await Promise.all([
      supabase.from("products").select("id,title,category,price_cents").ilike("title", like).limit(limit),
      supabase.from("service_listings").select("id,title,category,base_price_cents").ilike("title", like).limit(limit),
      supabase.from("shops").select("id,slug,name,tagline").ilike("name", like).limit(limit),
      supabase.from("local_listings").select("id,title,city,price_cents").ilike("title", like).limit(limit),
      supabase.from("courses").select("id,title,instructor").ilike("title", like).limit(limit),
      supabase.from("travel_listings").select("id,airline,origin,destination,origin_code,destination_code,price_cents").or(
        `origin.ilike.${like},destination.ilike.${like},airline.ilike.${like},origin_code.ilike.${like},destination_code.ilike.${like}`,
      ).limit(limit),
    ]);

    const hits: SearchHit[] = [];
    (products.data ?? []).forEach((p) =>
      hits.push({ id: p.id, kind: "product", title: p.title, subtitle: p.category, href: "/marketplace?tab=products", meta: `$${(p.price_cents / 100).toFixed(2)}` }),
    );
    (services.data ?? []).forEach((s) =>
      hits.push({ id: s.id, kind: "service", title: s.title, subtitle: s.category, href: "/marketplace?tab=services", meta: `from $${(s.base_price_cents / 100).toFixed(0)}` }),
    );
    (shops.data ?? []).forEach((s) =>
      hits.push({ id: s.id, kind: "shop", title: s.name, subtitle: s.tagline ?? "Storefront", href: `/marketplace?tab=shops` }),
    );
    (locals.data ?? []).forEach((l) =>
      hits.push({ id: l.id, kind: "local", title: l.title, subtitle: l.city ?? "Local", href: "/marketplace?tab=local", meta: `$${(l.price_cents / 100).toFixed(0)}` }),
    );
    (courses.data ?? []).forEach((c) =>
      hits.push({ id: c.id, kind: "course", title: c.title, subtitle: c.instructor, href: "/studio" }),
    );
    (travel.data ?? []).forEach((t) =>
      hits.push({
        id: t.id, kind: "travel",
        title: `${t.origin_code} → ${t.destination_code}`,
        subtitle: `${t.airline} · ${t.origin} → ${t.destination}`,
        href: "/travel",
        meta: `$${(t.price_cents / 100).toFixed(0)}`,
      }),
    );
    return hits;
  },
};

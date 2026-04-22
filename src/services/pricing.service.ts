import { supabase } from "@/integrations/supabase/client";

/**
 * Modular Pricing Engine
 * ---------------------------------------------------------------
 * Core is deterministic and runs client-side. Future plug-ins
 * (view-velocity, trend scorers) can be slotted in via `register`
 * without touching call-sites — the resolver caches a snapshot
 * of `pricing_rules` on first use to avoid DB thrash.
 */
export interface PricingContext {
  base_price_cents: number;
  stock?: number | null;
  category?: string;
  listing_id?: string;
  seed?: number; // for deterministic per-day variation
}

export type PricingAdapter = (ctx: PricingContext, params: Record<string, unknown>) => number;

interface PricingRule {
  id: string;
  rule_type: string;
  scope: string;
  params: Record<string, unknown>;
  active: boolean;
}

const adapters: Record<string, PricingAdapter> = {
  /** Nudges price ±max_swing_pct based on stock + a daily seed. Deterministic. */
  stock_index: (ctx, params) => {
    const max = Number(params.max_swing_pct ?? 5) / 100;
    const lowAt = Number(params.low_stock_threshold ?? 5);
    const stock = Math.max(0, ctx.stock ?? 999);
    // Low stock skews price up, abundant stock skews down. Bounded to ±max.
    const stockSignal = stock <= lowAt ? max : Math.max(-max, -((stock - lowAt) / 200));
    // Daily deterministic jitter so the storefront feels alive but predictable.
    const day = Math.floor(Date.now() / 86_400_000);
    const seedKey = `${ctx.listing_id ?? ""}-${day}`;
    let h = 0;
    for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) | 0;
    const jitter = ((h % 1000) / 1000 - 0.5) * max * 0.4;
    const factor = 1 + stockSignal + jitter;
    return Math.max(1, Math.round(ctx.base_price_cents * factor));
  },
};

let cache: PricingRule[] | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

async function getRules(): Promise<PricingRule[]> {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  const { data, error } = await supabase.from("pricing_rules").select("*").eq("active", true);
  if (error) throw error;
  cache = (data ?? []) as PricingRule[];
  cacheAt = Date.now();
  return cache;
}

export const pricingEngine = {
  /** Allow consumers to add their own deterministic adapters at runtime. */
  register(rule_type: string, adapter: PricingAdapter) {
    adapters[rule_type] = adapter;
  },
  async resolve(ctx: PricingContext): Promise<number> {
    const rules = await getRules();
    let price = ctx.base_price_cents;
    for (const r of rules) {
      const fn = adapters[r.rule_type];
      if (!fn) continue;
      // Scope filters — global always applies; category:<c> + listing:<id> match exactly.
      if (r.scope.startsWith("category:") && r.scope.split(":")[1] !== ctx.category) continue;
      if (r.scope.startsWith("listing:") && r.scope.split(":")[1] !== ctx.listing_id) continue;
      price = fn({ ...ctx, base_price_cents: price }, r.params);
    }
    return price;
  },
  /** Sync snapshot once rules are warmed — use after `prefetch()` for tight render loops. */
  resolveSync(ctx: PricingContext): number {
    if (!cache) return ctx.base_price_cents;
    let price = ctx.base_price_cents;
    for (const r of cache) {
      const fn = adapters[r.rule_type];
      if (!fn) continue;
      if (r.scope.startsWith("category:") && r.scope.split(":")[1] !== ctx.category) continue;
      if (r.scope.startsWith("listing:") && r.scope.split(":")[1] !== ctx.listing_id) continue;
      price = fn({ ...ctx, base_price_cents: price }, r.params);
    }
    return price;
  },
  prefetch: () => getRules(),
  invalidate: () => { cache = null; },
};

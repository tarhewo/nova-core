import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Star, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Marketplace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"featured" | "all">(params.get("featured") === "1" ? "featured" : "all");
  const [search, setSearch] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (tab === "featured" && !p.featured) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, tab, search]);

  const buy = useMutation({
    mutationFn: async ({ title, priceCents }: { title: string; priceCents: number }) =>
      api.profiles.send(`Shop · ${title}`, priceCents),
    onSuccess: () => {
      toast.success("Order placed");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">Marketplace</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Curated products with one-tap secure checkout.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="featured"><Sparkles className="mr-1 h-3.5 w-3.5" /> Featured</TabsTrigger>
            <TabsTrigger value="all">All products</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="pl-9 bg-secondary/40" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <GlassCard key={p.id} className="flex flex-col p-5 transition hover:border-primary/40">
            <div className="aspect-square w-full rounded-xl bg-gradient-primary/15 grid place-items-center">
              <ShoppingBag className="h-10 w-10 text-primary-glow" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold">{p.title}</h3>
              {p.featured && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">Featured</span>}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {p.rating}</span>
              <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{p.category}</span>
              <span>· {p.stock} left</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-display text-xl font-bold">${(p.price_cents / 100).toFixed(2)}</span>
              <Button
                size="sm"
                disabled={buy.isPending || !user?.id}
                onClick={() => buy.mutate({ title: p.title, priceCents: p.price_cents })}
                className="bg-gradient-primary text-primary-foreground hover:opacity-95"
              >
                Buy
              </Button>
            </div>
          </GlassCard>
        ))}
        {visible.length === 0 && <div className="text-sm text-muted-foreground">No products match.</div>}
      </div>
    </AppShell>
  );
}
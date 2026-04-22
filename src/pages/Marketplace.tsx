import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Private } from "@/components/shared/Private";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingBag, Briefcase, Store, MapPin, Star, Search, Sparkles, Plus, MessageCircle } from "lucide-react";
import { api } from "@/services/api";
import { serviceListingsService } from "@/services/serviceListings.service";
import { localListingsService } from "@/services/localListings.service";
import { shopsService } from "@/services/shops.service";
import { ordersService } from "@/services/orders.service";
import { pricingEngine } from "@/services/pricing.service";
import { messagesService } from "@/services/messages.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Tab = "products" | "services" | "shops" | "local";

export default function Marketplace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = (params.get("tab") as Tab) || (params.get("featured") === "1" ? "products" : "products");
  const [tab, setTab] = useState<Tab>(initial);
  const [search, setSearch] = useState("");

  // Keep URL in sync so the Command Bar deep-links work.
  useEffect(() => { setParams((p) => { const n = new URLSearchParams(p); n.set("tab", tab); return n; }, { replace: true }); }, [tab]);

  // Warm pricing rules once for the synchronous resolver.
  useEffect(() => { pricingEngine.prefetch().catch(() => undefined); }, []);

  // ---- Queries (each tab pulls from its own sovereign source) -------------
  const productsQ = useQuery({ queryKey: ["products"], queryFn: () => api.products.list() });
  const servicesQ = useQuery({ queryKey: ["service_listings"], queryFn: () => serviceListingsService.list() });
  const shopsQ = useQuery({ queryKey: ["shops"], queryFn: () => shopsService.list() });
  const localQ = useQuery({ queryKey: ["local_listings"], queryFn: () => localListingsService.list() });

  // ---- Purchases — all flow through marketplace_purchase RPC --------------
  const buy = useMutation({
    mutationFn: (input: { kind: "product" | "service" | "local"; listing_id: string; amount_cents: number; title: string }) =>
      ordersService.purchase(input),
    onSuccess: () => {
      toast.success("Order placed");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Chat — open or fetch a buyer↔seller conversation ----------------
  const chat = useMutation({
    mutationFn: (input: { kind: "service" | "local" | "shop"; listing_id: string; seller_id: string }) =>
      messagesService.openChat({ listing_kind: input.kind, listing_id: input.listing_id, seller_id: input.seller_id }),
    onSuccess: (chatId) => navigate(`/messages?chat=${chatId}`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Four sub-worlds. One secure wallet.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}…`} className="pl-9 bg-secondary/40" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="products"><ShoppingBag className="mr-1 h-3.5 w-3.5" /> Products</TabsTrigger>
          <TabsTrigger value="services"><Briefcase className="mr-1 h-3.5 w-3.5" /> Services</TabsTrigger>
          <TabsTrigger value="shops"><Store className="mr-1 h-3.5 w-3.5" /> Shops</TabsTrigger>
          <TabsTrigger value="local"><MapPin className="mr-1 h-3.5 w-3.5" /> Local</TabsTrigger>
        </TabsList>

        {/* PRODUCTS — Amazon-style */}
        <TabsContent value="products" className="mt-5">
          <ProductsGrid
            search={search}
            featured={params.get("featured") === "1"}
            data={productsQ.data ?? []}
            loading={productsQ.isLoading}
            onBuy={(p) => buy.mutate({ kind: "product", listing_id: p.id, amount_cents: pricingEngine.resolveSync({ base_price_cents: p.price_cents, stock: p.stock, category: p.category, listing_id: p.id }), title: p.title })}
            disabled={buy.isPending || !user}
          />
        </TabsContent>

        {/* SERVICES — Fiverr/Upwork-style */}
        <TabsContent value="services" className="mt-5 space-y-4">
          <CreateServiceDialog onCreated={() => qc.invalidateQueries({ queryKey: ["service_listings"] })} />
          <ServicesGrid
            search={search}
            data={servicesQ.data ?? []}
            loading={servicesQ.isLoading}
            onBook={(s) => buy.mutate({ kind: "service", listing_id: s.id, amount_cents: s.base_price_cents, title: s.title })}
            disabled={buy.isPending || !user}
          />
        </TabsContent>

        {/* SHOPS — Etsy storefronts */}
        <TabsContent value="shops" className="mt-5 space-y-4">
          <CreateShopDialog onCreated={() => qc.invalidateQueries({ queryKey: ["shops"] })} />
          <ShopsGrid search={search} data={shopsQ.data ?? []} loading={shopsQ.isLoading} />
        </TabsContent>

        {/* LOCAL — Jiji-style classifieds */}
        <TabsContent value="local" className="mt-5 space-y-4">
          <CreateLocalDialog onCreated={() => qc.invalidateQueries({ queryKey: ["local_listings"] })} />
          <LocalGrid
            search={search}
            data={localQ.data ?? []}
            loading={localQ.isLoading}
            onBuy={(l) => buy.mutate({ kind: "local", listing_id: l.id, amount_cents: l.price_cents, title: l.title })}
            disabled={buy.isPending || !user}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ---------- PRODUCTS ----------------------------------------------------
function ProductsGrid({ data, loading, onBuy, disabled, search, featured }: {
  data: Array<{ id: string; title: string; description: string | null; category: string; price_cents: number; stock: number; rating: number; featured: boolean }>;
  loading: boolean; onBuy: (p: { id: string; title: string; price_cents: number; category: string; stock: number }) => void;
  disabled: boolean; search: string; featured: boolean;
}) {
  const visible = useMemo(
    () => data.filter((p) => (!featured || p.featured) && (!search || p.title.toLowerCase().includes(search.toLowerCase()))),
    [data, search, featured],
  );
  if (loading) return <Skeleton />;
  if (!visible.length) return <Empty label="No products match." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((p) => {
        const live = pricingEngine.resolveSync({ base_price_cents: p.price_cents, stock: p.stock, category: p.category, listing_id: p.id });
        const drift = live - p.price_cents;
        return (
          <GlassCard key={p.id} className="flex flex-col p-5 transition hover:border-primary/40">
            <div className="aspect-square w-full rounded-xl bg-gradient-primary/15 grid place-items-center">
              <ShoppingBag className="h-10 w-10 text-primary-glow" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold">{p.title}</h3>
              {p.featured && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow"><Sparkles className="mr-0.5 inline h-2.5 w-2.5" />Featured</span>}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {p.rating}</span>
              <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{p.category}</span>
              <span>· {p.stock} left</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="font-display text-xl font-bold">${(live / 100).toFixed(2)}</span>
                {drift !== 0 && <span className={`ml-1 text-[10px] ${drift > 0 ? "text-warning" : "text-success"}`}>{drift > 0 ? "▲" : "▼"} dyn</span>}
              </div>
              <Button size="sm" disabled={disabled} onClick={() => onBuy({ ...p })} className="bg-gradient-primary text-primary-foreground hover:opacity-95">Buy</Button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

// ---------- SERVICES -----------------------------------------------------
function ServicesGrid({ data, loading, onBook, disabled, search }: {
  data: Array<{ id: string; title: string; description: string | null; category: string; base_price_cents: number; rating: number; delivery_days: number }>;
  loading: boolean; onBook: (s: { id: string; title: string; base_price_cents: number }) => void; disabled: boolean; search: string;
}) {
  const visible = data.filter((s) => !search || s.title.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Skeleton />;
  if (!visible.length) return <Empty label="No services yet — be the first to offer one." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((s) => (
        <GlassCard key={s.id} className="flex flex-col p-5 transition hover:border-primary/40">
          <div className="aspect-video w-full rounded-xl bg-gradient-primary/15 grid place-items-center">
            <Briefcase className="h-10 w-10 text-primary-glow" />
          </div>
          <h3 className="mt-3 font-display font-semibold">{s.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {s.rating}</span>
            <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{s.category}</span>
            <span>· {s.delivery_days}d delivery</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-xl font-bold">From ${(s.base_price_cents / 100).toFixed(0)}</span>
            <Button size="sm" disabled={disabled} onClick={() => onBook({ id: s.id, title: s.title, base_price_cents: s.base_price_cents })} className="bg-gradient-primary text-primary-foreground">Book</Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ---------- SHOPS --------------------------------------------------------
function ShopsGrid({ data, loading, search }: { data: Array<{ id: string; slug: string; name: string; tagline: string | null; rating: number; rating_count: number; verified: boolean }>; loading: boolean; search: string }) {
  const visible = data.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Skeleton />;
  if (!visible.length) return <Empty label="No shops yet — open the first storefront." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((s) => (
        <GlassCard key={s.id} className="flex flex-col p-5 transition hover:border-primary/40">
          <div className="aspect-[3/1] w-full rounded-xl bg-gradient-primary/20" />
          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Store className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display font-semibold">{s.name} {s.verified && <span className="ml-1 text-[10px] text-success">✓</span>}</h3>
              <p className="truncate text-xs text-muted-foreground">{s.tagline ?? "Storefront"}</p>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 text-warning" /> {s.rating} ({s.rating_count})</div>
        </GlassCard>
      ))}
    </div>
  );
}

// ---------- LOCAL --------------------------------------------------------
function LocalGrid({ data, loading, onBuy, disabled, search }: {
  data: Array<{ id: string; title: string; description: string | null; category: string; price_cents: number; condition: string; city: string | null; contact_method: string }>;
  loading: boolean; onBuy: (l: { id: string; title: string; price_cents: number }) => void; disabled: boolean; search: string;
}) {
  const visible = data.filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()) || (l.city ?? "").toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Skeleton />;
  if (!visible.length) return <Empty label="No local listings — post the first one." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((l) => (
        <GlassCard key={l.id} className="flex flex-col p-5 transition hover:border-primary/40">
          <div className="aspect-square w-full rounded-xl bg-gradient-primary/15 grid place-items-center">
            <MapPin className="h-10 w-10 text-primary-glow" />
          </div>
          <h3 className="mt-3 font-display font-semibold">{l.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{l.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{l.condition.replace("_", " ")}</span>
            <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{l.category}</span>
            {l.city && <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {l.city}</span>}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-xl font-bold">${(l.price_cents / 100).toFixed(0)}</span>
            <Button size="sm" disabled={disabled} onClick={() => onBuy({ id: l.id, title: l.title, price_cents: l.price_cents })} className="bg-gradient-primary text-primary-foreground">Buy</Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ---------- Helpers + Create dialogs ------------------------------------
function Skeleton() { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary/30" />)}</div>; }
function Empty({ label }: { label: string }) { return <GlassCard className="p-8 text-center text-sm text-muted-foreground">{label}</GlassCard>; }

function CreateServiceDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [cat, setCat] = useState("design"); const [price, setPrice] = useState(50); const [days, setDays] = useState(3);
  const m = useMutation({
    mutationFn: () => serviceListingsService.create({ title, description: desc, category: cat, base_price_cents: Math.max(1, Math.round(price * 100)), delivery_days: days }),
    onSuccess: () => { toast.success("Service published"); onCreated(); setOpen(false); setTitle(""); setDesc(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Offer a service</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Offer a service</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="I will design your brand identity" /></div>
          <div className="grid gap-1.5"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={1000} rows={3} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Category</Label><Input value={cat} onChange={(e) => setCat(e.target.value)} maxLength={40} /></div>
            <div className="grid gap-1.5"><Label>Price ($)</Label><Input type="number" min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div className="grid gap-1.5"><Label>Delivery (days)</Label><Input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={() => m.mutate()} disabled={m.isPending || !title} className="bg-gradient-primary text-primary-foreground">Publish</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateShopDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [tag, setTag] = useState(""); const [desc, setDesc] = useState("");
  const m = useMutation({
    mutationFn: () => shopsService.create({ name, tagline: tag, description: desc }),
    onSuccess: () => { toast.success("Shop opened"); onCreated(); setOpen(false); setName(""); setTag(""); setDesc(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Open a shop</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Open a shop</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Shop name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></div>
          <div className="grid gap-1.5"><Label>Tagline</Label><Input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={140} /></div>
          <div className="grid gap-1.5"><Label>About</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} rows={3} /></div>
        </div>
        <DialogFooter><Button onClick={() => m.mutate()} disabled={m.isPending || !name} className="bg-gradient-primary text-primary-foreground">Open shop</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateLocalDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [price, setPrice] = useState(50); const [city, setCity] = useState(""); const [cond, setCond] = useState<"new"|"like_new"|"used"|"for_parts">("used");
  const m = useMutation({
    mutationFn: () => localListingsService.create({ title, description: desc, price_cents: Math.max(1, Math.round(price * 100)), city, condition: cond }),
    onSuccess: () => { toast.success("Listing posted"); onCreated(); setOpen(false); setTitle(""); setDesc(""); setCity(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Post a listing</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Post a local listing</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></div>
          <div className="grid gap-1.5"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={1000} rows={3} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Price ($)</Label><Input type="number" min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div className="grid gap-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} /></div>
            <div className="grid gap-1.5">
              <Label>Condition</Label>
              <select className="h-10 rounded-md border border-input bg-secondary/40 px-2 text-sm" value={cond} onChange={(e) => setCond(e.target.value as typeof cond)}>
                <option value="new">New</option><option value="like_new">Like new</option><option value="used">Used</option><option value="for_parts">For parts</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={() => m.mutate()} disabled={m.isPending || !title} className="bg-gradient-primary text-primary-foreground">Publish</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Plane, Search, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Travel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.get("focus") === "1") ref.current?.focus();
  }, [params]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["travel", q],
    queryFn: () => api.travel.search(q),
  });

  const book = useMutation({
    mutationFn: async (priceCents: number) => api.profiles.send("Travel · Booking", priceCents),
    onSuccess: () => {
      toast.success("Flight booked");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">Travel</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Search live routes from our partner network.</p>

      <GlassCard variant="strong" className="mt-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="City, airport code, or airline (e.g. JFK, Tokyo, Aurora)" className="pl-9 bg-secondary/40" />
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-3">
        {isLoading && <div className="text-sm text-muted-foreground">Searching…</div>}
        {!isLoading && results.length === 0 && <div className="text-sm text-muted-foreground">No flights match — try a different airport or city.</div>}
        {results.map((r) => {
          const dep = new Date(r.departure_at);
          return (
            <GlassCard key={r.id} className="p-4 transition hover:border-primary/40">
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Plane className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-display text-base font-semibold">
                    {r.origin_code} <ArrowRight className="h-4 w-4 text-muted-foreground" /> {r.destination_code}
                    <span className="ml-2 rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{r.cabin}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.airline} · {r.origin} → {r.destination}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {dep.toLocaleString()} · {Math.floor(r.duration_minutes / 60)}h {r.duration_minutes % 60}m
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold">${(r.price_cents / 100).toFixed(0)}</div>
                  <Button
                    size="sm"
                    disabled={book.isPending || !user?.id}
                    onClick={() => book.mutate(r.price_cents)}
                    className="mt-1 bg-gradient-primary text-primary-foreground hover:opacity-95"
                  >
                    Book
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}
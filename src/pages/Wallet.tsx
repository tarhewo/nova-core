import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { WalletWidget } from "@/components/widgets/WalletWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { CreditCard, Plus, Trash2, Star, ArrowDown, ArrowUp, Search } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const INCOME = new Set(["topup", "refund"]);

export default function Wallet() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => (await api.profiles.getProfile(user!.id)).data,
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => (await api.transactions.list(user!.id, 50)).data ?? [],
  });

  const { data: methods = [] } = useQuery({
    queryKey: ["payment-methods", user?.id],
    enabled: !!user?.id,
    queryFn: () => api.payment.list(user!.id),
  });

  const visible = useMemo(() => {
    return txs.filter((t) => {
      if (filter === "income" && !INCOME.has(t.type)) return false;
      if (filter === "expense" && INCOME.has(t.type)) return false;
      if (search.trim() && !(t.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [txs, filter, search]);

  const addCard = useMutation({
    mutationFn: () => {
      const brands = ["Visa", "Mastercard", "Amex"];
      return api.payment.add(user!.id, {
        brand: brands[Math.floor(Math.random() * brands.length)],
        last4: String(Math.floor(1000 + Math.random() * 9000)),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: 2027 + Math.floor(Math.random() * 4),
        is_default: methods.length === 0,
        nickname: null,
      });
    },
    onSuccess: () => {
      toast.success("Card linked");
      qc.invalidateQueries({ queryKey: ["payment-methods", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCard = useMutation({
    mutationFn: (id: string) => api.payment.remove(id),
    onSuccess: () => {
      toast.success("Card removed");
      qc.invalidateQueries({ queryKey: ["payment-methods", user?.id] });
    },
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => api.payment.setDefault(user!.id, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-methods", user?.id] }),
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">Wallet</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage balances, transactions, and linked cards.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <WalletWidget userId={user?.id} balance={profile?.wallet_balance} />
          <GlassCard variant="strong" className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Payment methods</h3>
              <Button size="sm" onClick={() => addCard.mutate()} disabled={addCard.isPending} className="bg-gradient-primary text-primary-foreground">
                <Plus className="mr-1 h-3.5 w-3.5" /> Link card
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {methods.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                  No cards linked yet.
                </div>
              )}
              {methods.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.brand} •••• {m.last4}{" "}
                      {m.is_default && <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-glow">DEFAULT</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Exp {String(m.exp_month).padStart(2, "0")}/{m.exp_year}</p>
                  </div>
                  {!m.is_default && (
                    <Button variant="ghost" size="icon" onClick={() => setDefault.mutate(m.id)} aria-label="Set default">
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeCard.mutate(m.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard variant="strong" className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">Transactions</h3>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions" className="pl-9 bg-secondary/40" />
            </div>
            <ul className="mt-4 divide-y divide-border/30">
              {visible.length === 0 && (
                <li className="py-8 text-center text-sm text-muted-foreground">No transactions match.</li>
              )}
              {visible.map((t) => {
                const inc = INCOME.has(t.type);
                const dollars = (t.amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-xl ${inc ? "bg-success/15 text-success" : "bg-secondary/60 text-primary"}`}>
                      {inc ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.description ?? t.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()} · {t.status}</p>
                    </div>
                    <div className={`font-display text-sm font-semibold ${inc ? "text-success" : ""}`}>
                      {inc ? "+" : "−"}${dollars}
                    </div>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { ShoppingBag, Plane, Plus, Activity, CreditCard, RotateCcw } from "lucide-react";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  payment: CreditCard, purchase: ShoppingBag, booking: Plane, topup: Plus, refund: RotateCcw,
};

const STATUS_COLOR: Record<string, string> = {
  completed: "text-success",
  pending: "text-warning",
  failed: "text-destructive",
  refunded: "text-muted-foreground",
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const labelFor = (type: string, description?: string | null) => {
  if (description) return description;
  switch (type) {
    case "topup": return "Wallet top-up";
    case "payment": return "Payment";
    case "purchase": return "Marketplace purchase";
    case "booking": return "Travel booking";
    case "refund": return "Refund";
    default: return "Transaction";
  }
};

export const RecentActivity = ({ userId }: { userId?: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      const { data, error } = await api.transactions.list(userId!, 8);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return (
    <GlassCard variant="strong" className="p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Recent activity</h3>
        <span className="text-xs text-muted-foreground">Last 8 events</span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-12" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
          No transactions yet — try topping up your wallet.
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {data.map((t, i) => {
            const Icon = ICON[t.type] ?? Activity;
            const sign = t.type === "topup" || t.type === "refund" ? "+" : "−";
            const dollars = (t.amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-3 py-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{labelFor(t.type, t.description)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(t.created_at)} · <span className={STATUS_COLOR[t.status] ?? ""}>{t.status}</span>
                  </p>
                </div>
                <div className={`font-display text-sm font-semibold ${sign === "+" ? "text-success" : ""}`}>
                  {sign}${dollars}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
};
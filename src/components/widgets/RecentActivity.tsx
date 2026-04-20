import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { GlassCard } from "@/components/shared/GlassCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { LogIn, ShoppingBag, Plane, Plus, Activity } from "lucide-react";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn, purchase: ShoppingBag, booking: Plane, topup: Plus, other: Activity,
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const labelFor = (type: string, metadata: Record<string, unknown>) => {
  switch (type) {
    case "login": return "Signed in to Nexus";
    case "topup": {
      const amt = typeof metadata.amount === "number" ? metadata.amount / 100 : 0;
      return `Wallet top-up · $${amt.toFixed(2)}`;
    }
    case "purchase": return "Marketplace purchase";
    case "booking": return "Travel booking confirmed";
    default: return "Activity";
  }
};

export const RecentActivity = ({ userId }: { userId?: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", userId],
    queryFn: async () => {
      const { data, error } = await activityService.list(userId!, 8);
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
          No activity yet — try topping up your wallet.
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {data.map((a) => {
            const Icon = ICON[a.action_type] ?? Activity;
            return (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{labelFor(a.action_type, (a.metadata ?? {}) as Record<string, unknown>)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(a.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
};
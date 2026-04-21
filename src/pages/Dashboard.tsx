import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { WalletWidget } from "@/components/widgets/WalletWidget";
import { RecentActivity } from "@/components/widgets/RecentActivity";
import { QuickActions } from "@/components/widgets/QuickActions";
import { HealthCheck } from "@/components/widgets/HealthCheck";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Crown } from "lucide-react";
import { DynamicInsights } from "@/components/widgets/DynamicInsights";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await api.profiles.getProfile(user!.id);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Welcome back, <span className="text-gradient">{profile?.full_name ?? user?.email?.split("@")[0] ?? "there"}</span>
          </h1>
          {profile?.tier && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">
              <Crown className="h-3 w-3" /> {profile.tier}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Your unified command center — wallet, travel, studio, marketplace.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-5">
          <WalletWidget userId={user?.id} balance={profile?.wallet_balance} loading={isLoading} />
          <DynamicInsights balance={profile?.wallet_balance ?? 0} />
          <QuickActions balance={profile?.wallet_balance ?? 0} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <RecentActivity userId={user?.id} />
          <HealthCheck />
        </div>
      </div>

      <footer className="mt-10 flex items-center justify-center gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 font-medium text-success">
          Security Verified by Lovable Cloud · RLS · Atomic RPC · Realtime Isolation
        </span>
      </footer>
    </AppShell>
  );
}
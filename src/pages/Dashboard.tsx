import { useQuery } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { WalletWidget } from "@/components/widgets/WalletWidget";
import { RecentActivity } from "@/components/widgets/RecentActivity";
import { QuickActions } from "@/components/widgets/QuickActions";
import { HealthCheck } from "@/components/widgets/HealthCheck";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Crown } from "lucide-react";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar name={profile?.full_name ?? undefined} avatarUrl={profile?.avatar_url ?? undefined} />
          <main className="flex-1 p-4 md:p-8">
            <div className="mb-8 animate-fade-up">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Welcome back, <span className="text-gradient">{profile?.full_name ?? user?.email?.split("@")[0] ?? "there"}</span>
                </h1>
                {profile?.tier && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">
                    <Crown className="h-3 w-3" /> {profile.tier}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Your unified command center — wallet, travel, studio, marketplace.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-5">
                <WalletWidget userId={user?.id} balance={profile?.wallet_balance} loading={isLoading} />
                <QuickActions />
              </div>
              <div className="lg:col-span-2 space-y-5">
                <RecentActivity userId={user?.id} />
                <HealthCheck />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
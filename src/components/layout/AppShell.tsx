import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { useRealtimeWallet } from "@/hooks/useRealtimeWallet";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  useRealtimeWallet(user?.id);
  useRealtimeNotifications(user?.id);
  const { data: profile } = useQuery({
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
            <Breadcrumbs />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
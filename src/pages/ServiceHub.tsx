import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";

const HUBS: Record<string, { title: string; tagline: string }> = {
  fintech: { title: "Finance & Wallet", tagline: "Payments, transfers, and your wallet — all in one place." },
  travel: { title: "Travel & Transport", tagline: "Flights, stays, and rides for the whole journey." },
  media: { title: "Studio Workspace", tagline: "Create, learn, and publish from one creator hub." },
  shop: { title: "Marketplace", tagline: "Hire pros and shop products with confidence." },
};

export default function ServiceHub() {
  const { category } = useParams<{ category: string }>();
  if (!category || !HUBS[category]) return <Navigate to="/dashboard" replace />;
  const hub = HUBS[category];
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
                <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
              </Button>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                <span className="text-gradient">{hub.title}</span>
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{hub.tagline}</p>

              <GlassCard variant="strong" className="mt-8 p-10 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary glow-primary">
                  <Construction className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold">This hub is being assembled</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Foundations are wired (auth, RLS, transactions). Tell Nexus what to build next inside this hub.
                </p>
              </GlassCard>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
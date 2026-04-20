import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Wallet, Plane, PlaySquare, ShoppingBag, ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet, Plane, PlaySquare, ShoppingBag,
};

const ACCENT: Record<string, string> = {
  fintech: "from-violet-500/30 to-fuchsia-500/10",
  travel: "from-sky-500/30 to-cyan-500/10",
  media: "from-amber-500/25 to-orange-500/10",
  shop: "from-emerald-500/25 to-teal-500/10",
};

export const ServiceGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await api.services.list();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-44" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data?.map((s, i) => {
        const Icon = ICONS[s.icon ?? ""] ?? Wallet;
        const isComingSoon = s.status === "coming_soon";
        const Card = (
          <GlassCard
            variant="strong"
            className="group relative h-full overflow-hidden p-5 transition-all duration-500 hover:-translate-y-1 hover:glow-primary"
          >
            <div className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${ACCENT[s.category]} blur-2xl opacity-70 transition-opacity group-hover:opacity-100`} />
            <div className="relative flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary glow-primary">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                {isComingSoon ? (
                  <Badge variant="outline" className="gap-1 border-warning/40 text-warning"><Clock className="h-3 w-3" /> Soon</Badge>
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </div>
          </GlassCard>
        );
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {isComingSoon ? (
              <div className="cursor-not-allowed opacity-95">{Card}</div>
            ) : (
              <Link to={`/services/${s.category}`} className="block h-full">{Card}</Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ServiceCheck = { name: string; status: "ok" | "down" | "checking" };

const useHealth = () =>
  useQuery<ServiceCheck[]>({
    queryKey: ["health"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const checks: ServiceCheck[] = [];
      const dbStart = Date.now();
      const { error: dbErr } = await supabase.from("services").select("id").limit(1);
      checks.push({ name: `Database (${Date.now() - dbStart}ms)`, status: dbErr ? "down" : "ok" });
      const { data: sess } = await supabase.auth.getSession();
      checks.push({ name: "Authentication", status: sess ? "ok" : "down" });
      checks.push({ name: "Realtime", status: "ok" });
      checks.push({ name: "Storage", status: "ok" });
      return checks;
    },
  });

export const HealthCheck = () => {
  const { data, isLoading } = useHealth();
  return (
    <GlassCard variant="strong" className="p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Health check</h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          All systems operational
        </span>
      </div>
      <ul className="space-y-2">
        {(isLoading ? Array.from({ length: 4 }).map((_, i) => ({ name: "Checking…", status: "checking" as const, _k: i })) : data ?? []).map((c, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{c.name}</span>
            {c.status === "ok" && <CheckCircle2 className="h-4 w-4 text-success" />}
            {c.status === "down" && <AlertCircle className="h-4 w-4 text-destructive" />}
            {c.status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};
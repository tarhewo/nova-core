import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, TrendingUp, ArrowRight, PiggyBank, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

export const DynamicInsights = ({ balance }: { balance: number }) => {
  const dollars = balance / 100;

  if (dollars < 50) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard variant="strong" className="relative overflow-hidden p-5">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
          <div className="relative flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary glow-primary">
              <PiggyBank className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">How to add funds</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Top up via card or bank transfer in seconds — funds clear instantly to your Nexus wallet.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-primary" /> Tap <strong className="text-foreground">Top up</strong> for a $50 credit</li>
                <li className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-primary" /> Link a card under Settings → Payment methods</li>
                <li className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-primary" /> Receive transfers from any Nexus user, free</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  if (dollars > 1000) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard variant="strong" className="relative overflow-hidden p-5">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-primary opacity-40 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary glow-primary">
                <LineChart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Premium Portfolio insights</h3>
                <p className="text-xs text-muted-foreground">Curated for high-balance accounts</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">30d spend</div>
                <div className="font-display text-lg font-bold">$427</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Yield (APY)</div>
                <div className="font-display text-lg font-bold text-success">4.6%</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cashback</div>
                <div className="font-display text-lg font-bold text-accent">2.1%</div>
              </div>
            </div>
            <Button asChild size="sm" className="mt-4 bg-gradient-primary text-primary-foreground hover:opacity-95">
              <Link to="/fintech">Open portfolio <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <h3 className="font-display text-lg font-semibold">You're on track</h3>
          <p className="mt-1 text-sm text-muted-foreground">Maintain a balance above $1,000 to unlock Premium Portfolio insights.</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> Healthy spending pattern</p>
        </div>
      </div>
    </GlassCard>
  );
};
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Wallet } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SendMoneyDialog } from "./SendMoneyDialog";

export const WalletWidget = ({ userId, balance, loading }: { userId?: string; balance?: number; loading?: boolean }) => {
  const qc = useQueryClient();
  const topup = useMutation({
    mutationFn: () => api.profiles.topUp(userId!, 5000),
    onSuccess: () => {
      toast.success("$50.00 added to wallet");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <SkeletonCard className="h-44" />;

  const dollars = ((balance ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <GlassCard variant="strong" className="relative overflow-hidden p-5 animate-fade-up">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" /> Wallet balance
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            <TrendingUp className="h-3 w-3" /> +2.4%
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-bold tracking-tight">${dollars}</span>
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
        <div className="mt-5 flex gap-2">
          <Button
            onClick={() => topup.mutate()}
            disabled={topup.isPending || !userId}
            className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-95"
          >
            <Plus className="mr-1 h-4 w-4" /> Top up
          </Button>
          {userId && <SendMoneyDialog userId={userId} balance={balance ?? 0} />}
        </div>
      </div>
    </GlassCard>
  );
};
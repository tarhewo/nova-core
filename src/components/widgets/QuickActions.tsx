import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/shared/GlassCard";
import { Plane, ShoppingBag, PlaySquare, Wallet } from "lucide-react";
import { SendMoneyDialog } from "./SendMoneyDialog";

export const QuickActions = ({ balance = 0 }: { balance?: number }) => {
  const navigate = useNavigate();
  const [sendOpen, setSendOpen] = useState(false);

  const actions = [
    { label: "Send money", icon: Wallet, onClick: () => setSendOpen(true) },
    { label: "Book flight", icon: Plane, onClick: () => navigate("/travel?focus=1") },
    { label: "Browse shop", icon: ShoppingBag, onClick: () => navigate("/marketplace?featured=1") },
    { label: "Open studio", icon: PlaySquare, onClick: () => navigate("/studio") },
  ];

  return (
    <GlassCard variant="strong" className="p-5 animate-fade-up">
      <h3 className="mb-4 font-display text-lg font-semibold">Quick actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="group flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/40 p-3 text-left text-sm transition-all hover:border-primary/40 hover:bg-secondary/70 hover:-translate-y-0.5"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground transition-transform group-hover:scale-105">
              <a.icon className="h-4 w-4" />
            </div>
            <span className="font-medium">{a.label}</span>
          </button>
        ))}
      </div>
      <SendMoneyDialog balance={balance} open={sendOpen} onOpenChange={setSendOpen} hideTrigger />
    </GlassCard>
  );
};
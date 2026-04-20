import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Props { userId: string; balance: number }

export const SendMoneyDialog = ({ userId, balance }: Props) => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const send = useMutation({
    mutationFn: async () => {
      const cents = Math.round(parseFloat(amount) * 100);
      if (!recipient.trim()) throw new Error("Recipient is required");
      if (!cents || cents <= 0) throw new Error("Enter a valid amount");
      if (cents > balance) throw new Error("Low balance — top up to send this amount");

      // Atomic server-side transfer (prevents double-spend & RLS bypass)
      await api.profiles.send(recipient.trim(), cents);
    },
    onSuccess: () => {
      toast.success(`Sent $${parseFloat(amount).toFixed(2)} to ${recipient}`);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setOpen(false);
      setRecipient(""); setAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary/40">
          <ArrowUpRight className="mr-1 h-4 w-4" /> Send
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Send money</DialogTitle>
          <DialogDescription>
            Transfer funds instantly. Available balance: <span className="font-semibold text-foreground">${(balance / 100).toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); send.mutate(); }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient</Label>
            <Input id="recipient" placeholder="Email or @nexus handle" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={send.isPending} className="bg-gradient-primary text-primary-foreground hover:opacity-95 glow-primary">
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
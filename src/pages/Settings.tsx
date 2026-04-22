import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { usePrivacy } from "@/store/privacy";
import { toast } from "sonner";
import { User, Shield, Bell, KeyRound } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { mode, stealth, setMode, toggleStealth } = usePrivacy();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await api.profiles.getProfile(user!.id);
      if (error) throw error;
      return data;
    },
  });

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [emailOnPurchase, setEmailOnPurchase] = useState(true);
  const [emailOnMessage, setEmailOnMessage] = useState(true);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePw = useMutation({
    mutationFn: async () => {
      if (pw1.length < 8) throw new Error("Password must be at least 8 characters");
      if (pw1 !== pw2) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Password updated"); setPw1(""); setPw2(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">Settings</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Profile, privacy, security, and notification preferences.</p>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="profile"><User className="mr-1 h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-1 h-3.5 w-3.5" /> Privacy</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className="mr-1 h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="notifs"><Bell className="mr-1 h-3.5 w-3.5" /> Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GlassCard variant="strong" className="mt-4 max-w-2xl space-y-4 p-6">
            <div className="grid gap-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" maxLength={120} />
            </div>
            <div className="grid gap-2">
              <Label>Avatar URL</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" maxLength={500} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-gradient-primary text-primary-foreground">
              Save profile
            </Button>
          </GlassCard>
        </TabsContent>

        <TabsContent value="privacy">
          <GlassCard variant="strong" className="mt-4 max-w-2xl space-y-5 p-6">
            <div>
              <h3 className="font-display text-lg font-semibold">Obsidian Privacy Mode</h3>
              <p className="text-sm text-muted-foreground">Pick how sensitive values are obfuscated across every world.</p>
            </div>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="grid gap-3">
              {[
                { v: "smart", t: "Smart Hybrid", d: "Blur for scannable values, mask for high-security tokens (recommended)." },
                { v: "blur", t: "Blur Only", d: "Soft blur on every tagged value." },
                { v: "mask", t: "Mask Only", d: "Replace with bullets across the board." },
                { v: "off", t: "Off", d: "Show all values normally." },
              ].map((o) => (
                <label key={o.v} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/40 bg-secondary/20 p-3 hover:border-primary/40">
                  <RadioGroupItem value={o.v} id={`pm-${o.v}`} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{o.t}</div>
                    <div className="text-xs text-muted-foreground">{o.d}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <Separator />
            <div className="flex items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
              <div>
                <div className="font-medium">Stealth Mode</div>
                <div className="text-xs text-muted-foreground">Instantly hides every tagged value across all worlds.</div>
              </div>
              <Switch checked={stealth} onCheckedChange={toggleStealth} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="security">
          <GlassCard variant="strong" className="mt-4 max-w-2xl space-y-4 p-6">
            <h3 className="font-display text-lg font-semibold">Update password</h3>
            <div className="grid gap-2">
              <Label>New password</Label>
              <Input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} maxLength={72} />
            </div>
            <div className="grid gap-2">
              <Label>Confirm password</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} maxLength={72} />
            </div>
            <Button onClick={() => updatePw.mutate()} disabled={updatePw.isPending || !pw1} className="bg-gradient-primary text-primary-foreground">
              Update password
            </Button>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notifs">
          <GlassCard variant="strong" className="mt-4 max-w-2xl space-y-4 p-6">
            <h3 className="font-display text-lg font-semibold">Notification preferences</h3>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">Purchases & top-ups</div>
                <div className="text-xs text-muted-foreground">Receipts and confirmations.</div>
              </div>
              <Switch checked={emailOnPurchase} onCheckedChange={setEmailOnPurchase} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">New messages</div>
                <div className="text-xs text-muted-foreground">Buyer ↔ seller chats and Messenger pings.</div>
              </div>
              <Switch checked={emailOnMessage} onCheckedChange={setEmailOnMessage} />
            </div>
            <p className="text-[11px] text-muted-foreground">Preferences are stored locally this round; backend wiring lands with the Messenger world.</p>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

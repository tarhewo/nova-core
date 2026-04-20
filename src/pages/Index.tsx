import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ServiceGrid } from "@/components/widgets/ServiceGrid";
import { GlassCard } from "@/components/shared/GlassCard";
import { TrustBar } from "@/components/widgets/TrustBar";
import { motion } from "framer-motion";

const Index = () => {
  const [q, setQ] = useState("");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> One account · Every service
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
              Your <span className="text-gradient">super app</span>,
              <br className="hidden sm:block" /> one beautiful login away.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Wallet, travel, studio, and marketplace — unified in a single high-trust workspace.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl glass p-2"
            >
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search anything — flights, courses, freelancers…"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-95">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Bank-grade security</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent" /> Real-time everywhere</span>
            </div>
          </motion.div>
        </section>

        <TrustBar />

        {/* SERVICE NAVIGATOR */}
        <section className="container pb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">Service Navigator</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick a hub to get started.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/dashboard">Open dashboard →</Link>
            </Button>
          </div>
          <ServiceGrid />
        </section>

        {/* CTA */}
        <section className="container pb-24">
          <GlassCard variant="strong" className="relative overflow-hidden p-8 md:p-12">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h3 className="font-display text-2xl font-bold md:text-3xl">Ready to consolidate your stack?</h3>
                <p className="mt-2 text-muted-foreground">Spin up your Nexus account in under a minute.</p>
              </div>
              <div className="flex justify-end">
                <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-95 glow-primary">
                  <Link to="/auth">Create your account</Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        </section>
      </main>
      <footer className="border-t border-border/40 py-8">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nexus Super App. Crafted with intention.
        </div>
      </footer>
    </div>
  );
};

export default Index;

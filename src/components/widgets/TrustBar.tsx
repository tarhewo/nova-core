import { motion } from "framer-motion";
import { Users, Layers, ShieldCheck, Zap } from "lucide-react";

const stats = [
  { icon: Users, value: "10k+", label: "Active users" },
  { icon: Layers, value: "50+", label: "Services" },
  { icon: ShieldCheck, value: "99.99%", label: "Uptime" },
  { icon: Zap, value: "<120ms", label: "Avg. latency" },
];

export const TrustBar = () => (
  <section className="container pb-10">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-5 md:p-6"
    >
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  </section>
);
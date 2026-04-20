import { Hexagon } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="group flex items-center gap-2.5">
    <div className="relative">
      <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow-primary">
        <Hexagon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display text-lg font-bold text-gradient">Nexus</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Super App</span>
    </div>
  </Link>
);
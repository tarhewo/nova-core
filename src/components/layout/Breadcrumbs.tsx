import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  wallet: "Wallet",
  travel: "Travel",
  studio: "Studio",
  marketplace: "Marketplace",
  fintech: "Wallet",
  media: "Studio",
};

export const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" /> Home
      </Link>
      {parts.map((p, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const last = i === parts.length - 1;
        return (
          <span key={href} className="inline-flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 opacity-50" />
            {last ? (
              <span className="font-medium text-foreground">{LABELS[p] ?? p}</span>
            ) : (
              <Link to={href} className="hover:text-foreground transition-colors">{LABELS[p] ?? p}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
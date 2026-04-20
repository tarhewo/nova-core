import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { LogOut, LayoutDashboard } from "lucide-react";

export const SiteHeader = () => {
  const { session } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/40 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
              </Button>
              <Button onClick={() => authService.signOut()} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-95 glow-primary">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
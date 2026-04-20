import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export const TopBar = ({ name, avatarUrl }: { name?: string; avatarUrl?: string }) => {
  const { user } = useAuth();
  const initials = (name ?? user?.email ?? "U").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search…" className="pl-9 bg-secondary/50" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary transition" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        </button>
        <Avatar className="h-9 w-9 ring-2 ring-primary/30">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
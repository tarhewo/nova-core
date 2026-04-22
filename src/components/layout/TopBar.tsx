import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsPopover } from "@/components/widgets/NotificationsPopover";
import { CommandBar } from "@/components/widgets/CommandBar";
import { PrivacyToggle } from "@/components/widgets/PrivacyToggle";

export const TopBar = ({ name, avatarUrl }: { name?: string; avatarUrl?: string }) => {
  const { user } = useAuth();
  const initials = (name ?? user?.email ?? "U").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <div className="ml-2 flex flex-1 items-center">
        <CommandBar />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <PrivacyToggle />
        <NotificationsPopover />
        <Avatar className="h-9 w-9 ring-2 ring-primary/30">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
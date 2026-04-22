import { Eye, EyeOff, ShieldCheck, Shield } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { applyPrivacyAttribute, usePrivacy, type PrivacyMode } from "@/store/privacy";
import { cn } from "@/lib/utils";

/** Header dropdown that drives the global privacy controller. */
export function PrivacyToggle() {
  const { mode, stealth, setMode, toggleStealth } = usePrivacy();

  // Keep <html data-privacy-mode> in sync at all times.
  useEffect(() => { applyPrivacyAttribute(mode, stealth); }, [mode, stealth]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Privacy settings"
          className={cn(
            "h-9 w-9 transition",
            stealth ? "text-warning" : mode !== "off" ? "text-primary-glow" : "text-muted-foreground",
          )}
        >
          {stealth ? <ShieldCheck className="h-4 w-4" /> : mode === "off" ? <Eye className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Obsidian Privacy
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as PrivacyMode)}>
          <DropdownMenuRadioItem value="smart">Smart Hybrid <span className="ml-auto text-[10px] text-muted-foreground">default</span></DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="blur">Blur Only</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="mask">Mask Only</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleStealth} className="gap-2">
          {stealth ? <EyeOff className="h-4 w-4 text-warning" /> : <ShieldCheck className="h-4 w-4" />}
          <span className="flex-1">{stealth ? "Disable Stealth Mode" : "Enable Stealth Mode"}</span>
          <kbd className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">⌘⇧P</kbd>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Tap any blurred value to reveal it for 3 seconds. Stealth instantly hides every tagged value across all worlds.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
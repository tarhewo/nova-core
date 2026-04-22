import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Briefcase, Store, MapPin, PlaySquare, Plane } from "lucide-react";
import { searchService, type SearchHit, type SearchKind } from "@/services/search.service";

const kindIcon: Record<SearchKind, React.ComponentType<{ className?: string }>> = {
  product: ShoppingBag,
  service: Briefcase,
  shop: Store,
  local: MapPin,
  course: PlaySquare,
  travel: Plane,
};
const kindLabel: Record<SearchKind, string> = {
  product: "Products",
  service: "Services",
  shop: "Shops",
  local: "Local",
  course: "Courses",
  travel: "Travel",
};

/** Universal Command Bar — federated search across every sovereign world. */
export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: hits = [], isFetching } = useQuery({
    queryKey: ["command-bar", term],
    enabled: term.trim().length > 0,
    queryFn: () => searchService.query(term),
    staleTime: 15_000,
  });

  const grouped = hits.reduce<Record<SearchKind, SearchHit[]>>((acc, h) => {
    (acc[h.kind] ??= []).push(h);
    return acc;
  }, {} as Record<SearchKind, SearchHit[]>);

  const go = (h: SearchHit) => { setOpen(false); setTerm(""); navigate(h.href); };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-md justify-between gap-2 rounded-xl bg-secondary/40 px-3 text-muted-foreground hover:bg-secondary/60 md:flex"
        aria-label="Open universal search"
      >
        <span className="inline-flex items-center gap-2 text-sm">
          <Search className="h-4 w-4" />
          Search products, services, shops…
        </span>
        <kbd className="rounded bg-muted px-1.5 text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="md:hidden" aria-label="Search">
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search the federation…" value={term} onValueChange={setTerm} />
        <CommandList>
          {!term && (
            <CommandEmpty>
              <p className="text-xs text-muted-foreground">Start typing to search across every world.</p>
            </CommandEmpty>
          )}
          {term && hits.length === 0 && !isFetching && <CommandEmpty>No matches.</CommandEmpty>}
          {(Object.keys(grouped) as SearchKind[]).map((kind, i) => {
            const Icon = kindIcon[kind];
            return (
              <div key={kind}>
                {i > 0 && <CommandSeparator />}
                <CommandGroup heading={kindLabel[kind]}>
                  {grouped[kind].map((h) => (
                    <CommandItem key={`${kind}-${h.id}`} value={`${kind}-${h.title}-${h.id}`} onSelect={() => go(h)}>
                      <Icon className="mr-2 h-4 w-4 text-primary-glow" />
                      <span className="flex-1 truncate">{h.title}</span>
                      {h.subtitle && <span className="ml-2 truncate text-xs text-muted-foreground">{h.subtitle}</span>}
                      {h.meta && <span className="ml-2 rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{h.meta}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

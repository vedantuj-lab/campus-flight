import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchCampus, type Destination } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { nodeIndex } from "@/lib/campus/data";
import { CategoryIcon, categoryLabel } from "@/components/nav/CategoryIcon";

export function SearchBar() {
  const { selectDestination, user } = useNavigator();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const results = useMemo(() => searchCampus(q, 7), [q]);

  const distanceTo = (d: Destination) => {
    const n = nodeIndex.get(d.nodeId);
    if (!n) return null;
    const m = Math.round(Math.hypot(n.x - user.x, n.z - user.z));
    return { m, min: Math.max(1, Math.round(m / 75)) };
  };

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="campus-search">
        Search campus
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3.5 py-2.5 transition-colors focus-within:border-primary/60">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id="campus-search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 140);
          }}
          placeholder="Search rooms, labs, buildings — try “B204”"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="glass-strong absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl p-1.5">
          {results.map((d, i) => {
            const dist = distanceTo(d);
            return (
              <li key={d.id} style={{ animationDelay: `${i * 28}ms` }} className="animate-fade-in">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (blurTimer.current) clearTimeout(blurTimer.current);
                    selectDestination(d);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/70 focus-visible:bg-secondary/70 focus-visible:outline-none"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                    <CategoryIcon category={d.category} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{d.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {d.type} · {d.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[11px]">
                    {dist && (
                      <span className="block font-medium text-primary">
                        {dist.m} m · {dist.min} min
                      </span>
                    )}
                    <span className="block text-muted-foreground">{categoryLabel(d.category)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

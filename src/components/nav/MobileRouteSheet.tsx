import { useEffect, useState } from "react";
import { ChevronUp, Navigation } from "lucide-react";
import { RoutePanel } from "@/components/nav/RoutePanel";
import { useNavigator } from "@/lib/state";

/**
 * Mobile-first bottom sheet: the 3D map stays full-screen and route details
 * slide up over it. Hidden on xl where the docked side panel is used.
 */
export function MobileRouteSheet() {
  const { destination, navState, route, formatLength } = useNavigator();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (destination) setExpanded(true);
  }, [destination]);

  if (!destination || navState === "NAVIGATING" || navState === "ARRIVED") return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex justify-center xl:hidden">
      <div
        className={`glass-strong pointer-events-auto w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl transition-[max-height] duration-300 ${
          expanded ? "max-h-[60vh]" : "max-h-24"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-primary-foreground">
            <Navigation className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{destination.name}</span>
            <span className="block text-[11px] text-muted-foreground">
              {route ? `${formatLength(route.distance)} · ${route.minutes} min` : "Calculating…"}
            </span>
          </span>
          <ChevronUp
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
        <div className="max-h-[52vh] overflow-y-auto">
          <RoutePanel />
        </div>
      </div>
    </div>
  );
}

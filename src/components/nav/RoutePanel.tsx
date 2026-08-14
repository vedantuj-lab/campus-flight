import {
  Accessibility,
  ArrowRight,
  Clock,
  Footprints,
  Layers,
  Navigation,
  Route as RouteIcon,
  Star,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigator } from "@/lib/state";
import { routeModes } from "@/lib/routing/engine";
import { CategoryIcon } from "@/components/nav/CategoryIcon";
import { crowdTone } from "@/components/nav/tone";

export function RoutePanel() {
  const {
    destination,
    route,
    alternatives,
    mode,
    setMode,
    startNavigation,
    navState,
    selectDestination,
    favorites,
    toggleFavorite,
    crowdFor,
    formatLength,
    error,
  } = useNavigator();

  if (!destination) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Navigation</p>
        <p className="text-sm text-muted-foreground">
          Search a room, tap a building in the 3D campus, or ask Campus AI to plot a route.
        </p>
      </div>
    );
  }

  const crowd = crowdFor(destination.buildingId);
  const fav = favorites.includes(destination.id);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-primary-foreground">
          <CategoryIcon category={destination.category} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Destination</p>
          <h2 className="truncate text-lg font-semibold leading-tight">{destination.name}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {destination.type} · {destination.subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          onClick={() => toggleFavorite(destination.id)}
        >
          <Star
            className={`h-4.5 w-4.5 ${fav ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </button>
        <button
          type="button"
          aria-label="Clear destination"
          onClick={() => selectDestination(null)}
        >
          <X className="h-4.5 w-4.5 text-muted-foreground" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 text-danger" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {route && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Footprints} label="Distance" value={formatLength(route.distance)} />
            <Stat icon={Clock} label="ETA" value={`${route.minutes} min`} />
            <Stat
              icon={Layers}
              label="Floors"
              value={route.floorsCrossed.map((f) => (f === 0 ? "G" : f)).join(" → ")}
            />
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Route
            </p>
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              {route.summary.map((s, i) => (
                <span key={`${s}-${i}`} className="flex items-center gap-1">
                  <span className="rounded-md bg-secondary/70 px-1.5 py-0.5">{s}</span>
                  {i < route.summary.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={crowdTone(crowd.level)}>
              <Users className="mr-1 h-3 w-3" aria-hidden /> {crowd.level} crowd · {crowd.occupancy}
              %
            </Badge>
            {route.usesElevator && (
              <Badge variant="outline" className="border-success/40 text-success">
                🛗 Elevator
              </Badge>
            )}
            {route.usesStairs && (
              <Badge variant="outline" className="border-warning/40 text-warning">
                Stairs
              </Badge>
            )}
            {destination.accessible && (
              <Badge variant="outline" className="border-success/40 text-success">
                <Accessibility className="mr-1 h-3 w-3" aria-hidden /> Accessible
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Button
              className="h-11 w-full gap-2 text-sm font-semibold"
              onClick={startNavigation}
              disabled={navState === "NAVIGATING"}
            >
              <Navigation className="h-4 w-4" aria-hidden />
              {navState === "NAVIGATING" ? "Navigating…" : "Start navigation"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-1.5" onClick={() => setMode("accessible")}>
                <Accessibility className="h-4 w-4" aria-hidden /> Accessible
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setMode("avoid_construction")}
              >
                <TriangleAlert className="h-4 w-4" aria-hidden /> Avoid 🚧
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Alternative routes
            </p>
            <div className="space-y-1.5">
              {alternatives.map((alt) => (
                <button
                  key={alt.mode}
                  type="button"
                  onClick={() => setMode(alt.mode)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                    alt.mode === mode
                      ? "border-primary/60 bg-primary/10"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <RouteIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
                    {routeModes.find((r) => r.id === alt.mode)?.label}
                  </span>
                  <span className="text-muted-foreground">
                    {alt.minutes} min · {formatLength(alt.distance)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-3">
      <Icon className="mb-1 h-3.5 w-3.5 text-primary" aria-hidden />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

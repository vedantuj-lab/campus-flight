import { Link } from "@tanstack/react-router";
import {
  Accessibility,
  CalendarClock,
  Compass,
  Gauge,
  MapPinned,
  ScanEye,
  Star,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigator } from "@/lib/state";
import { Switch } from "@/components/ui/switch";

const items = [
  { to: "/app", label: "Explore", icon: Compass, exact: true },
  { to: "/app/places", label: "Places", icon: MapPinned },
  { to: "/app/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/app/favorites", label: "Favorites", icon: Star },
  { to: "/app/ar", label: "AR Mode", icon: ScanEye },
  { to: "/app/admin", label: "Admin", icon: Gauge },
  { to: "/app/profile", label: "Profile", icon: UserRound },
] as const;

export function Sidebar() {
  const { mode, setMode } = useNavigator();
  return (
    <aside className="glass hidden w-60 shrink-0 flex-col gap-2 rounded-none border-y-0 border-l-0 p-4 lg:flex">
      <Link to="/" className="mb-4 flex items-center gap-2.5 px-2">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] shadow-[var(--shadow-glow)]">
          <Compass className="h-5 w-5 text-primary-foreground" aria-hidden />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">Campus3D</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Navigator
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Main">
        {items.map(({ to, label, icon: Icon, ...rest }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: "exact" in rest ? rest.exact : false }}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all",
              "hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            activeProps={{
              className:
                "bg-[image:var(--gradient-accent)] text-primary-foreground shadow-[var(--shadow-glow)] hover:text-primary-foreground",
            }}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3 rounded-2xl border border-border bg-secondary/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-medium">
            <Accessibility className="h-4 w-4 text-success" aria-hidden />
            Accessible routing
          </span>
          <Switch
            checked={mode === "accessible"}
            onCheckedChange={(v) => setMode(v ? "accessible" : "fastest")}
            aria-label="Toggle accessible routing"
          />
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Step-free paths, elevators preferred, construction avoided.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav
      className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-center justify-around rounded-none border-x-0 border-b-0 px-2 py-2 lg:hidden"
      aria-label="Mobile"
    >
      {items.slice(0, 5).map(({ to, label, icon: Icon, ...rest }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: "exact" in rest ? rest.exact : false }}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[10px] text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

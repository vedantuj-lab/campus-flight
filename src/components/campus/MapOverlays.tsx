import {
  Boxes,
  Crosshair,
  Layers,
  Locate,
  Maximize2,
  Minus,
  Plane,
  Plus,
  Users,
  Wifi,
} from "lucide-react";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { buildingById } from "@/lib/campus/data";
import { crowdTone } from "@/components/nav/tone";
import { Badge } from "@/components/ui/badge";

const floors = [0, 1, 2, 3];

export function FloorSelector() {
  const { activeFloor, setActiveFloor } = useNavigator();
  return (
    <div
      className="glass absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-2xl p-1.5"
      role="group"
      aria-label="Floor selector"
    >
      <span className="px-2 pb-1 pt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
        <Layers className="mb-0.5 mr-1 inline h-3 w-3" aria-hidden />
        Floor
      </span>
      {floors.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={activeFloor === f}
          onClick={() => setActiveFloor(f)}
          className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
            activeFloor === f
              ? "bg-[image:var(--gradient-accent)] text-primary-foreground shadow-[var(--shadow-glow)]"
              : "text-muted-foreground hover:bg-secondary/60"
          }`}
        >
          {f === 0 ? "G" : f}
        </button>
      ))}
    </div>
  );
}

export function MapControls() {
  const { sendCamera, showCrowd, setShowCrowd } = useNavigator();
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground";
  return (
    <div className="glass absolute right-4 top-4 z-10 flex flex-col gap-1 rounded-2xl p-1.5">
      <button
        type="button"
        className={btn}
        aria-label="Zoom in"
        onClick={() => sendCamera("zoom", 1)}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Zoom out"
        onClick={() => sendCamera("zoom", -1)}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Center on my position"
        onClick={() => sendCamera("gps")}
      >
        <Locate className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="3D isometric view"
        onClick={() => sendCamera("iso")}
      >
        <Boxes className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Top down view"
        onClick={() => sendCamera("top")}
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Fly through"
        onClick={() => sendCamera("fly")}
      >
        <Plane className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={`${btn} ${showCrowd ? "bg-primary/20 text-primary" : ""}`}
        aria-label="Toggle crowd overlay"
        aria-pressed={showCrowd}
        onClick={() => setShowCrowd(!showCrowd)}
      >
        <Users className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function IndoorBadge() {
  const { indoorMode, user } = useNavigator();
  if (!indoorMode) return null;
  return (
    <div className="glass absolute bottom-4 left-4 z-10 space-y-1 rounded-2xl px-3 py-2 text-[11px]">
      <p className="flex items-center gap-1.5 font-semibold text-primary">
        <Wifi className="h-3.5 w-3.5" aria-hidden /> Indoor positioning
      </p>
      <p className="text-muted-foreground">● WiFi signal · ● BLE beacon</p>
      <p className="text-muted-foreground">
        Accuracy: {Math.max(1.8, user.accuracy / 2).toFixed(1)} m
      </p>
    </div>
  );
}

export function BuildingCard() {
  const {
    selectedBuilding,
    setSelectedBuilding,
    crowdFor,
    selectBuilding,
    sendCamera,
    destination,
  } = useNavigator();
  const b = selectedBuilding ? buildingById(selectedBuilding) : null;
  if (!b || destination) return null;
  const crowd = crowdFor(b.id);
  return (
    <div className="glass-strong animate-scale-in absolute bottom-4 left-1/2 z-10 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{b.type}</p>
      <h3 className="text-base font-semibold">{b.name}</h3>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        <span>{b.rooms ?? 0} rooms</span>
        <span>· {b.labs ?? 0} labs</span>
        <span>· {b.floors} floors</span>
        <span>· {b.hours}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Badge variant="outline" className={crowdTone(crowd.level)}>
          {crowd.level} crowd
        </Badge>
        {b.accessibility && (
          <Badge variant="outline" className="border-success/40 text-success">
            ♿ Accessible
          </Badge>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button className="flex-1 gap-1.5" onClick={() => selectBuilding(b.id)}>
          <Crosshair className="h-4 w-4" aria-hidden /> Navigate
        </Button>
        <Button variant="outline" onClick={() => sendCamera("focus", { x: b.id })}>
          Fly to
        </Button>
        <Button variant="ghost" onClick={() => setSelectedBuilding(null)}>
          Close
        </Button>
      </div>
    </div>
  );
}

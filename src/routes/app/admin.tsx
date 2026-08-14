import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  CalendarPlus,
  Database,
  HardHat,
  MapPinPlus,
  RotateCcw,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { buildings, rooms } from "@/lib/campus/data";
import { campusStore, useCampusStore } from "@/lib/campus/store";
import { persistenceLabel } from "@/lib/firebase/client";
import type { CampusState } from "@/lib/campus/store";
import { useNavigator } from "@/lib/state";
import { crowdTone } from "@/components/nav/tone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CrowdLevel } from "@/types/campus";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Campus Admin Console — Campus3D Navigator" },
      {
        name: "description",
        content:
          "Monitor active navigations, crowd density, construction zones and popular destinations.",
      },
      { property: "og:title", content: "Campus Admin Console" },
      { property: "og:description", content: "Operational dashboard for the campus digital twin." },
    ],
  }),
  component: AdminPage,
});

const selectZones = (s: CampusState) => s.zones;
const selectSessions = (s: CampusState) => s.sessions;
const selectPlaces = (s: CampusState) => s.places;
const selectEvents = (s: CampusState) => s.events;
const crowdLevels: CrowdLevel[] = ["low", "moderate", "high"];

function AdminPage() {
  const { crowdFor } = useNavigator();
  const zones = useCampusStore(selectZones);
  const sessions = useCampusStore(selectSessions);
  const places = useCampusStore(selectPlaces);
  const events = useCampusStore(selectEvents);

  const [zoneName, setZoneName] = useState("");
  const [zoneBuilding, setZoneBuilding] = useState("library");
  const [placeName, setPlaceName] = useState("");
  const [placeBuilding, setPlaceBuilding] = useState("ce");
  const [placeFloor, setPlaceFloor] = useState("0");
  const [eventTitle, setEventTitle] = useState("");
  const [eventBuilding, setEventBuilding] = useState("audi");

  const activeZones = zones.filter((z) => z.status === "active").length;
  const alerts = buildings.filter((b) => crowdFor(b.id).level === "high").length;
  const activeSessions = sessions.filter((s) => !s.completedAt).length;

  const popular = useMemo(() => {
    const counts = new Map<string, number>();
    sessions.forEach((s) =>
      counts.set(s.destinationName, (counts.get(s.destinationName) ?? 0) + 1),
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sessions]);

  const stats = [
    { label: "Active users", value: `${1248 + activeSessions}`, icon: Users },
    { label: "Active navigations", value: `${327 + activeSessions}`, icon: Activity },
    { label: "Crowd alerts", value: `${alerts}`, icon: TriangleAlert },
    { label: "Construction zones", value: `${activeZones}`, icon: HardHat },
  ];

  const addZone = () => {
    const b = buildings.find((x) => x.id === zoneBuilding);
    if (!b || !zoneName.trim()) return;
    campusStore.saveZone({
      id: `cz-${Date.now()}`,
      name: zoneName.trim(),
      status: "active",
      x: b.x,
      z: b.z + b.depth / 2 + 22,
      radius: 24,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    });
    setZoneName("");
  };

  const addPlace = () => {
    const b = buildings.find((x) => x.id === placeBuilding);
    if (!b || !placeName.trim()) return;
    campusStore.addPlace({
      id: `pl-${Date.now()}`,
      name: placeName.trim(),
      buildingId: b.id,
      floor: Number(placeFloor),
      type: "Point of interest",
      category: "administration",
      accessible: true,
      hours: b.hours ?? "Campus hours",
    });
    setPlaceName("");
  };

  const addEvent = () => {
    if (!eventTitle.trim()) return;
    campusStore.addEvent({
      id: `ev-${Date.now()}`,
      title: eventTitle.trim(),
      buildingId: eventBuilding,
      startsAt: "10:00 AM",
      endsAt: "01:00 PM",
      audience: "Open campus",
    });
    setEventTitle("");
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Campus operations</h1>
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Database className="h-3.5 w-3.5 text-primary" aria-hidden />
          Persistence: {persistenceLabel()}
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => campusStore.reset()}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demo data
          </Button>
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <s.icon className="mb-2 h-4 w-4 text-primary" aria-hidden />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Live crowd heatmap</h2>
          <p className="text-[11px] text-muted-foreground">
            Sliders write to the crowd collection and instantly change routing weights.
          </p>
          <div className="mt-3 space-y-3">
            {buildings.slice(0, 8).map((b) => {
              const c = crowdFor(b.id);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-xs">{b.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${c.occupancy}%`,
                        background:
                          c.level === "high"
                            ? "var(--danger)"
                            : c.level === "moderate"
                              ? "var(--warning)"
                              : "var(--success)",
                      }}
                    />
                  </div>
                  <Badge variant="outline" className={crowdTone(c.level)}>
                    {c.occupancy}%
                  </Badge>
                  <div className="flex gap-1">
                    {crowdLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        aria-label={`Set ${b.name} crowd to ${level}`}
                        aria-pressed={c.level === level}
                        onClick={() =>
                          campusStore.setCrowd(
                            b.id,
                            level,
                            level === "high" ? 88 : level === "moderate" ? 60 : 25,
                          )
                        }
                        className={`h-6 rounded-lg border px-2 text-[10px] capitalize transition-colors ${
                          c.level === level
                            ? "border-primary/50 bg-primary/20 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Construction zones</h2>
          <p className="text-[11px] text-muted-foreground">
            Activating a zone re-weights the walkway graph — open routes recalculate immediately.
          </p>
          <div className="mt-3 space-y-2">
            {zones.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">🚧 {c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.startDate} → {c.endDate}
                  </p>
                </div>
                <Select
                  value={c.status}
                  onValueChange={(status) =>
                    campusStore.saveZone({ ...c, status: status as typeof c.status })
                  }
                >
                  <SelectTrigger className="h-8 w-28 text-[11px]" aria-label={`${c.name} status`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="planned">planned</SelectItem>
                    <SelectItem value="cleared">cleared</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => campusStore.removeZone(c.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 rounded-xl border border-border p-3">
            <Label htmlFor="zone-name" className="text-[11px]">
              Add construction zone
            </Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="zone-name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="e.g. Library plaza rewiring"
                className="h-9 min-w-40 flex-1 text-xs"
              />
              <Select value={zoneBuilding} onValueChange={setZoneBuilding}>
                <SelectTrigger className="h-9 w-44 text-xs" aria-label="Zone location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="gap-1.5" onClick={addZone}>
                <HardHat className="h-4 w-4" aria-hidden /> Add
              </Button>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Places & rooms</h2>
          <p className="text-[11px] text-muted-foreground">
            {buildings.length} buildings · {rooms.length} seeded rooms · {places.length} admin
            additions
          </p>
          <div className="mt-3 space-y-2">
            {places.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {buildings.find((b) => b.id === p.buildingId)?.name} · Floor {p.floor}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => campusStore.removePlace(p.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
            {!places.length && (
              <p className="text-[11px] text-muted-foreground">No admin-added places yet.</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Place name"
              aria-label="Place name"
              className="h-9 min-w-36 flex-1 text-xs"
            />
            <Select value={placeBuilding} onValueChange={setPlaceBuilding}>
              <SelectTrigger className="h-9 w-40 text-xs" aria-label="Place building">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={placeFloor} onValueChange={setPlaceFloor}>
              <SelectTrigger className="h-9 w-24 text-xs" aria-label="Place floor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0", "1", "2", "3"].map((f) => (
                  <SelectItem key={f} value={f}>
                    Floor {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5" onClick={addPlace}>
              <MapPinPlus className="h-4 w-4" aria-hidden /> Add place
            </Button>
          </div>
        </section>

        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Events & navigation sessions</h2>
          <div className="mt-3 space-y-2">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {buildings.find((b) => b.id === e.buildingId)?.name} · {e.startsAt} – {e.endsAt}
                  </p>
                </div>
                <Badge variant="outline">{e.audience}</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${e.title}`}
                  onClick={() => campusStore.removeEvent(e.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title"
              aria-label="Event title"
              className="h-9 min-w-36 flex-1 text-xs"
            />
            <Select value={eventBuilding} onValueChange={setEventBuilding}>
              <SelectTrigger className="h-9 w-40 text-xs" aria-label="Event venue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5" onClick={addEvent}>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Add event
            </Button>
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Popular destinations
          </h3>
          <div className="mt-2 space-y-1.5">
            {popular.length ? (
              popular.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="truncate">{name}</span>
                  <Badge variant="outline">{count} routes</Badge>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Start a navigation to record a session.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Activity, HardHat, TriangleAlert, Users } from "lucide-react";
import { buildings, constructionZones } from "@/lib/campus/data";
import { useNavigator } from "@/lib/state";
import { crowdTone } from "@/components/nav/tone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Campus Admin Console — Campus3D Navigator" },
      { name: "description", content: "Monitor active navigations, crowd density, construction zones and popular destinations." },
      { property: "og:title", content: "Campus Admin Console" },
      { property: "og:description", content: "Operational dashboard for the campus digital twin." },
    ],
  }),
  component: AdminPage,
});

const stats = [
  { label: "Active users", value: "1,248", icon: Users },
  { label: "Active navigations", value: "327", icon: Activity },
  { label: "Crowd alerts", value: "12", icon: TriangleAlert },
  { label: "Construction zones", value: "4", icon: HardHat },
];

function AdminPage() {
  const { crowdFor } = useNavigator();
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <h1 className="text-xl font-semibold">Campus operations</h1>
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
          <div className="mt-3 space-y-2">
            {buildings.slice(0, 8).map((b) => {
              const c = crowdFor(b.id);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 truncate text-xs">{b.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${c.occupancy}%`,
                        background:
                          c.level === "high" ? "var(--danger)" : c.level === "moderate" ? "var(--warning)" : "var(--success)",
                      }}
                    />
                  </div>
                  <Badge variant="outline" className={crowdTone(c.level)}>
                    {c.occupancy}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Construction zones</h2>
          <div className="mt-3 space-y-2">
            {constructionZones.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">🚧 {c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.startDate} → {c.endDate}
                  </p>
                </div>
                <Badge variant="outline" className={c.status === "active" ? "border-warning/40 text-warning" : "border-border"}>
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Add place", "Add construction", "Update crowd", "Manage rooms", "Manage events"].map((a) => (
              <Button key={a} size="sm" variant="outline">
                {a}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

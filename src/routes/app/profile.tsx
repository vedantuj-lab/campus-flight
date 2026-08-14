import { createFileRoute } from "@tanstack/react-router";
import { destinationById } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { routeModes } from "@/lib/routing/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Campus3D Navigator" },
      { name: "description", content: "Manage navigation preferences, accessibility defaults, units and saved places." },
      { property: "og:title", content: "Profile & Settings — Campus3D Navigator" },
      { property: "og:description", content: "Personalise routing defaults and accessibility preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { mode, setMode, favorites, recents } = useNavigator();
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="glass flex items-center gap-4 rounded-2xl p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-accent)] text-lg font-bold text-primary-foreground">
          VD
        </span>
        <div>
          <h1 className="text-lg font-semibold">Vedant Dalvi</h1>
          <p className="text-xs text-muted-foreground">vedant@nova.edu · Computer Engineering, Sem 6</p>
        </div>
      </div>

      <section className="glass mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Default route preference</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {routeModes.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={mode === m.id ? "default" : "outline"}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-3 text-xs">
            <p className="text-muted-foreground">Units</p>
            <p className="font-medium">Meters</p>
          </div>
          <div className="rounded-xl border border-border p-3 text-xs">
            <p className="text-muted-foreground">Theme</p>
            <p className="font-medium">Dark (campus night)</p>
          </div>
        </div>
      </section>

      <section className="glass mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Saved & recent</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...favorites, ...recents].map((id, i) => (
            <Badge key={`${id}-${i}`} variant="outline">
              {destinationById(id)?.name ?? id}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}

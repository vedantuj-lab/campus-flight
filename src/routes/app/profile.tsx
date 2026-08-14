import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, Moon, Ruler, Sparkles, Star, Sun } from "lucide-react";
import { destinationById } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { routeModes } from "@/lib/routing/engine";
import { formatDistance } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Campus3D Navigator" },
      {
        name: "description",
        content: "Manage navigation preferences, accessibility defaults, units and saved places.",
      },
      { property: "og:title", content: "Profile & Settings — Campus3D Navigator" },
      {
        property: "og:description",
        content: "Personalise routing defaults and accessibility preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { mode, setMode, favorites, recents, profile, updateProfile, selectDestination } =
    useNavigator();

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-full overflow-y-auto p-4 pb-24 lg:p-6">
      <div className="glass flex items-center gap-4 rounded-2xl p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-accent)] text-lg font-bold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{profile.name}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {profile.email} · {profile.program}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto capitalize">
          {profile.role}
        </Badge>
      </div>

      <section className="glass mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Default route preference</h2>
        <p className="text-[11px] text-muted-foreground">
          Applied to every new route, and used the next time you open the app.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {routeModes.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={profile.defaultRouteMode === m.id ? "default" : "outline"}
              aria-pressed={profile.defaultRouteMode === m.id}
              onClick={() => {
                updateProfile({ defaultRouteMode: m.id });
                setMode(m.id);
              }}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Currently routing with <span className="text-foreground">{mode.replace("_", " ")}</span>.
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label htmlFor="pref-access" className="flex items-center gap-2 text-xs">
              <Accessibility className="h-4 w-4 text-success" aria-hidden />
              Always prefer step-free routes
            </Label>
            <Switch
              id="pref-access"
              checked={profile.accessibilityPreference}
              onCheckedChange={(v) => {
                updateProfile({ accessibilityPreference: v });
                setMode(v ? "accessible" : profile.defaultRouteMode);
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label className="flex items-center gap-2 text-xs">
              <Ruler className="h-4 w-4 text-primary" aria-hidden />
              Units
            </Label>
            <div className="flex gap-2">
              {(["metric", "imperial"] as const).map((u) => (
                <Button
                  key={u}
                  size="sm"
                  variant={profile.units === u ? "default" : "outline"}
                  aria-pressed={profile.units === u}
                  onClick={() => updateProfile({ units: u })}
                >
                  {u === "metric" ? "Meters" : "Feet"}
                </Button>
              ))}
            </div>
          </div>
          <p className="px-1 text-[11px] text-muted-foreground">
            280 m reads as {formatDistance(280, profile.units)}.
          </p>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label className="flex items-center gap-2 text-xs">
              {profile.theme === "dark" ? (
                <Moon className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <Sun className="h-4 w-4 text-warning" aria-hidden />
              )}
              Theme
            </Label>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={profile.theme === t ? "default" : "outline"}
                  aria-pressed={profile.theme === t}
                  onClick={() => updateProfile({ theme: t })}
                >
                  {t === "dark" ? "Campus night" : "Daylight"}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label htmlFor="pref-motion" className="flex items-center gap-2 text-xs">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden />
              Reduce motion
            </Label>
            <Switch
              id="pref-motion"
              checked={profile.reducedMotion}
              onCheckedChange={(v) => updateProfile({ reducedMotion: v })}
            />
          </div>
        </div>
      </section>

      <section className="glass mt-4 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Star className="h-4 w-4 text-warning" aria-hidden /> Saved & recent
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...new Set([...favorites, ...recents])].map((id) => {
            const d = destinationById(id);
            if (!d) return null;
            return (
              <Button
                key={id}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => selectDestination(d)}
              >
                {d.name}
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

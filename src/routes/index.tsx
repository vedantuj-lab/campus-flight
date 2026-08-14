import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  Boxes,
  Compass,
  Layers,
  Navigation,
  ScanEye,
  Satellite,
  Users,
} from "lucide-react";
import { CampusCanvas } from "@/components/campus/CampusCanvas";
import { NavigatorProvider } from "@/lib/state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus3D Navigator — Your Campus. Your Route. In 3D." },
      {
        name: "description",
        content:
          "Turn your university into an intelligent 3D digital map with live GPS, indoor multi-floor routing, accessible paths and crowd intelligence.",
      },
      { property: "og:title", content: "Campus3D Navigator — Your Campus. Your Route. In 3D." },
      {
        property: "og:description",
        content: "Interactive WebGL campus navigation with animated routes, AR mode and campus AI.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Satellite, title: "Live GPS", copy: "Watch-position tracking with indoor fallback." },
  { icon: Boxes, title: "3D Navigation", copy: "A real WebGL digital twin of the campus." },
  { icon: Layers, title: "Multi-Floor Routing", copy: "Elevators, stairwells and floor transitions." },
  { icon: Accessibility, title: "Accessible Paths", copy: "Step-free routing with elevator preference." },
  { icon: Users, title: "Crowd Intelligence", copy: "Live occupancy overlays on every block." },
  { icon: ScanEye, title: "AR Navigation", copy: "Camera overlay with arrows and landmarks." },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] shadow-[var(--shadow-glow)]">
            <Compass className="h-5 w-5 text-primary-foreground" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">Campus3D Navigator</span>
        </span>
        <Link to="/app">
          <Button size="sm" variant="outline">
            Open dashboard
          </Button>
        </Link>
      </header>

      <main>
        <section
          className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-6 lg:grid-cols-2"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
              Your Campus. Your Route. In 3D.
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Navigate Your Campus. <span className="text-gradient">In 3D.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Campus3D Navigator transforms your university into an intelligent 3D digital map with
              real-time navigation, indoor routing, accessibility paths, and campus intelligence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app">
                <Button size="lg" className="gap-2">
                  <Boxes className="h-4 w-4" aria-hidden /> Explore Campus
                </Button>
              </Link>
              <Link to="/app">
                <Button size="lg" variant="outline" className="gap-2">
                  <Navigation className="h-4 w-4" aria-hidden /> Start Navigation
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass relative h-[22rem] overflow-hidden rounded-3xl sm:h-[30rem]">
            <NavigatorProvider>
              <CampusCanvas />
            </NavigatorProvider>
            <span className="glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-[10px] text-muted-foreground">
              Live WebGL preview · drag to orbit
            </span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <article
                key={f.title}
                className="glass animate-fade-in rounded-2xl p-5 transition-transform hover:-translate-y-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <f.icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold">{f.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{f.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Campus3D Navigator · Nova Institute of Technology digital twin demo
      </footer>
    </div>
  );
}

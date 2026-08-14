import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CampusCanvas } from "@/components/campus/CampusCanvas";
import { BuildingCard, FloorSelector, IndoorBadge, MapControls } from "@/components/campus/MapOverlays";
import { NavigationCard } from "@/components/nav/NavigationCard";
import { RoutePanel } from "@/components/nav/RoutePanel";
import { Button } from "@/components/ui/button";
import { useNavigator } from "@/lib/state";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "3D Campus Map — Campus3D Navigator" },
      {
        name: "description",
        content:
          "Explore an interactive WebGL campus digital twin with animated routes, floor switching and crowd overlays.",
      },
      { property: "og:title", content: "3D Campus Map — Campus3D Navigator" },
      { property: "og:description", content: "Interactive WebGL campus with intelligent routing." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { requestGps, runDemoScenario } = useNavigator();
  useEffect(() => {
    requestGps();
  }, [requestGps]);

  return (
    <div className="flex h-full min-h-0">
      <section className="relative min-w-0 flex-1" aria-label="3D campus map">
        <CampusCanvas />
        <FloorSelector />
        <MapControls />
        <IndoorBadge />
        <BuildingCard />
        <NavigationCard />
        <Button
          className="absolute bottom-4 right-4 z-10 gap-2"
          variant="secondary"
          onClick={runDemoScenario}
        >
          🎮 Run hackathon demo
        </Button>
      </section>
      <aside className="glass hidden w-[22rem] shrink-0 overflow-y-auto rounded-none border-y-0 border-r-0 xl:block">
        <RoutePanel />
      </aside>
    </div>
  );
}

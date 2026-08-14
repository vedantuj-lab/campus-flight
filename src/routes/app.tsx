import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NavigatorProvider } from "@/lib/state";
import { Sidebar, MobileNav } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { AssistantDock } from "@/components/ai/AssistantDock";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Navigation Dashboard — Campus3D Navigator" },
      {
        name: "description",
        content:
          "Explore the 3D campus digital twin, search rooms, and get animated turn-by-turn routes across floors.",
      },
      { property: "og:title", content: "Campus3D Navigator Dashboard" },
      {
        property: "og:description",
        content:
          "Interactive 3D campus navigation with live GPS, accessible routing and crowd intelligence.",
      },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <NavigatorProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="relative min-h-0 flex-1 overflow-hidden pb-14 lg:pb-0">
            <Outlet />
          </main>
        </div>
        <MobileNav />
        <AssistantDock />
      </div>
    </NavigatorProvider>
  );
}

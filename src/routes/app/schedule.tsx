import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { schedule } from "@/lib/campus/data";
import { destinationById } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/schedule")({
  head: () => ({
    meta: [
      { title: "Today's Schedule — Campus3D Navigator" },
      {
        name: "description",
        content: "See today's classes and navigate straight to the next lecture hall or lab.",
      },
      { property: "og:title", content: "Today's Schedule — Campus3D Navigator" },
      { property: "og:description", content: "Navigate to your next class in one tap." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { selectDestination } = useNavigator();
  const navigate = useNavigate();
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const next = schedule.find((s) => s.minutesFromMidnight >= minutes) ?? schedule[0]!;
  const go = (roomId: string) => {
    const d = destinationById(roomId);
    if (d) {
      selectDestination(d);
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <h1 className="text-xl font-semibold">Today</h1>
      <div className="glass mt-4 rounded-2xl border-primary/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Next class</p>
        <h2 className="text-lg font-semibold">{next.subject}</h2>
        <p className="text-xs text-muted-foreground">
          {destinationById(next.roomId)?.name} · {next.time} · {next.faculty}
        </p>
        <p className="mt-1 text-xs text-primary">
          Starts in {Math.max(0, next.minutesFromMidnight - minutes)} min
        </p>
        <Button className="mt-3" onClick={() => go(next.roomId)}>
          Navigate now
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {schedule.map((s) => (
          <article key={s.id} className="glass flex items-center gap-4 rounded-2xl p-4">
            <span className="w-20 shrink-0 text-xs font-semibold text-primary">{s.time}</span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium">{s.subject}</h3>
              <p className="truncate text-[11px] text-muted-foreground">
                {destinationById(s.roomId)?.name} · {s.faculty}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => go(s.roomId)}>
              Navigate
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

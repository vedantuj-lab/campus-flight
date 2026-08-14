import { ArrowUp, CornerUpLeft, CornerUpRight, MapPin, MoveUp, Square } from "lucide-react";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function NavigationCard() {
  const { navState, route, currentStep, progress, stopNavigation, destination } = useNavigator();
  if ((navState !== "NAVIGATING" && navState !== "ARRIVED") || !route) return null;
  const step = route.steps[Math.min(currentStep, route.steps.length - 1)]!;
  const arrived = navState === "ARRIVED";
  const Icon =
    arrived || step.kind === "arrive"
      ? MapPin
      : step.kind === "left"
        ? CornerUpLeft
        : step.kind === "right"
          ? CornerUpRight
          : step.kind === "elevator" || step.kind === "stairs"
            ? MoveUp
            : ArrowUp;

  const remaining = Math.max(0, Math.round(route.distance * (1 - progress)));

  return (
    <div className="glass-strong animate-fade-in absolute bottom-4 left-1/2 z-20 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            arrived ? "bg-success/20 text-success" : "bg-[image:var(--gradient-accent)] text-primary-foreground"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="truncate text-sm font-semibold">
            {arrived ? `You have arrived at ${destination?.name}` : step.text}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {arrived
              ? "🎉 Arrival confirmed · crowd low · accessible exit nearby"
              : `${remaining} m remaining · Floor ${route.steps[Math.min(currentStep, route.steps.length - 1)]!.floor === 0 ? "G" : step.floor}`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={stopNavigation}>
          <Square className="h-3.5 w-3.5" aria-hidden /> End
        </Button>
      </div>
      <Progress value={progress * 100} className="mt-3 h-1.5" />
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {route.steps.map((s, i) => (
          <span
            key={i}
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] ${
              i === currentStep
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {s.text}
          </span>
        ))}
      </div>
    </div>
  );
}

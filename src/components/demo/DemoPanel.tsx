import { useState } from "react";
import { ChevronDown, Gamepad2, PlayCircle, Radar, Sparkles } from "lucide-react";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Floating hackathon control deck: demo toggle, start point, guided run. */
export function DemoPanel() {
  const {
    demoMode,
    toggleDemoMode,
    startLocations,
    startLocationId,
    setStartLocation,
    simulateDrift,
    setSimulateDrift,
    runDemoScenario,
    demoStep,
    demoTotal,
  } = useNavigator();
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-20 flex w-[min(19rem,calc(100vw-2rem))] flex-col items-end gap-2">
      {open && (
        <div className="glass-strong animate-scale-in w-full space-y-3 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold">
              <Gamepad2 className="h-4 w-4 text-primary" aria-hidden /> Demo mode
            </span>
            <Switch
              checked={demoMode}
              onCheckedChange={toggleDemoMode}
              aria-label="Toggle demo mode"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="demo-start"
              className="text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              Starting location
            </label>
            <Select value={startLocationId} onValueChange={setStartLocation}>
              <SelectTrigger id="demo-start" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {startLocations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
            <span className="flex items-center gap-2 text-[11px]">
              <Radar className="h-3.5 w-3.5 text-accent" aria-hidden /> Simulate GPS drift
            </span>
            <Switch
              checked={simulateDrift}
              onCheckedChange={setSimulateDrift}
              aria-label="Simulate GPS drift"
            />
          </div>

          <Button className="w-full gap-2" onClick={runDemoScenario}>
            <PlayCircle className="h-4 w-4" aria-hidden /> Run 2-minute judge demo
          </Button>
          {demoStep > 0 && (
            <p className="text-center text-[10px] text-muted-foreground">
              Beat {Math.min(demoStep, demoTotal)} of {demoTotal}
            </p>
          )}
        </div>
      )}

      <Button
        variant="secondary"
        className="gap-2"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        Hackathon demo
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </Button>
    </div>
  );
}

/** Caption ribbon narrating the guided demo for judges. */
export function DemoCaption() {
  const { demoCaption, demoStep, demoTotal } = useNavigator();
  if (!demoCaption) return null;
  return (
    <div
      className="glass-strong animate-fade-in pointer-events-none absolute left-1/2 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
        Guided demo · step {Math.min(demoStep, demoTotal)}/{demoTotal}
      </p>
      <p className="text-sm font-medium leading-snug">{demoCaption}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary/60">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-accent)] transition-all duration-500"
          style={{ width: `${(Math.min(demoStep, demoTotal) / demoTotal) * 100}%` }}
        />
      </div>
    </div>
  );
}

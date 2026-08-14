import { Suspense, lazy, useEffect, useState } from "react";
import { Loader2, Compass } from "lucide-react";

const CampusScene = lazy(() => import("./CampusScene"));

export function CampusLoading({ label = "Loading Campus…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[#070b16]">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/60" />
        <span className="absolute inset-0 rounded-full border border-accent/30" />
        <span
          className="absolute inset-3 rounded-2xl border border-primary/50"
          style={{ transform: "rotateX(60deg) rotateZ(45deg)" }}
        />
        <Compass className="h-9 w-9 animate-float text-primary" aria-hidden />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {label}
      </div>
    </div>
  );
}

export function CampusCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <CampusLoading />;
  return (
    <Suspense fallback={<CampusLoading />}>
      <CampusScene />
    </Suspense>
  );
}

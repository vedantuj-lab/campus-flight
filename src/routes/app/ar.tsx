import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, ScanEye } from "lucide-react";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/ar")({
  head: () => ({
    meta: [
      { title: "AR Navigation (Beta) — Campus3D Navigator" },
      { name: "description", content: "Camera-based AR navigation overlay with direction arrows, distance and landmarks." },
      { property: "og:title", content: "AR Navigation — Campus3D Navigator" },
      { property: "og:description", content: "Point your camera and follow the arrows to your class." },
    ],
  }),
  component: ARPage,
});

function ARPage() {
  const { destination, route, progress } = useNavigator();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "live" | "denied">("idle");

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("live");
      } catch {
        setStatus("denied");
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const remaining = route ? Math.round(route.distance * (1 - progress)) : 120;

  return (
    <div className="relative h-full overflow-hidden bg-[#05080f]">
      <video ref={videoRef} muted playsInline className="h-full w-full object-cover opacity-80" />
      {status !== "live" && (
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass max-w-sm rounded-3xl p-6 text-center">
              <Camera className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden />
              <p className="text-sm font-medium">
                {status === "denied" ? "Camera unavailable — running AR simulation" : "Requesting camera…"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                The overlay below mirrors the live 3D route data.
              </p>
            </div>
          </div>
        </div>
      )}

      <span className="glass absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        <ScanEye className="mr-1 inline h-3 w-3" aria-hidden /> AR Navigation — Beta
      </span>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
        <ArrowUp className="h-24 w-24 animate-float text-primary drop-shadow-[0_0_25px_var(--glow)]" aria-hidden />
        <div className="glass-strong rounded-2xl px-5 py-3 text-center">
          <p className="text-lg font-semibold">{destination?.name ?? "B204"}</p>
          <p className="text-xs text-muted-foreground">{remaining} m · Turn left in 30 m</p>
        </div>
      </div>

      <div className="glass-strong absolute bottom-4 left-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-3 text-center text-xs text-muted-foreground">
        Landmarks ahead: Library plaza · Fountain · CE Block entrance
        <Button size="sm" variant="outline" className="mt-2 w-full">
          Recenter AR overlay
        </Button>
      </div>
    </div>
  );
}

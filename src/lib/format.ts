import type { Units } from "@/lib/firebase/schema";

const FEET_PER_METRE = 3.28084;

export function formatDistance(metres: number, units: Units = "metric"): string {
  if (units === "imperial") {
    const feet = metres * FEET_PER_METRE;
    return feet >= 5280 ? `${(feet / 5280).toFixed(1)} mi` : `${Math.round(feet)} ft`;
  }
  return metres >= 1000 ? `${(metres / 1000).toFixed(2)} km` : `${Math.round(metres)} m`;
}

export function formatEta(minutes: number): string {
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${Math.round(minutes % 60)} min`;
}

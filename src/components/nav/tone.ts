import type { CrowdLevel } from "@/types/campus";

export function crowdTone(level: CrowdLevel) {
  if (level === "high") return "border-danger/40 text-danger";
  if (level === "moderate") return "border-warning/40 text-warning";
  return "border-success/40 text-success";
}

export function crowdDot(level: CrowdLevel) {
  return level === "high" ? "🔴" : level === "moderate" ? "🟡" : "🟢";
}

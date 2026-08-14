import { buildings, rooms, buildingById } from "@/lib/campus/data";
import { nodeIndex } from "@/lib/campus/data";
import type { PlaceCategory } from "@/types/campus";

export interface Destination {
  id: string;
  nodeId: string;
  name: string;
  subtitle: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  category: PlaceCategory;
  type: string;
  accessible: boolean;
  hours: string;
  keywords: string;
}

const buildingDestinations: Destination[] = buildings.map((b) => ({
  id: `b:${b.id}`,
  nodeId: `e_${b.id}`,
  name: b.name,
  subtitle: `${b.type} · ${b.code}`,
  buildingId: b.id,
  buildingName: b.name,
  floor: 0,
  category: b.category,
  type: b.type,
  accessible: b.accessibility,
  hours: b.hours,
  keywords: `${b.name} ${b.code} ${b.type} ${b.category}`.toLowerCase(),
}));

const roomDestinations: Destination[] = rooms.map((r) => {
  const b = buildingById(r.building)!;
  return {
    id: r.id,
    nodeId: nodeIndex.has(`r_${r.id}`) ? `r_${r.id}` : `e_${b.id}`,
    name: r.name,
    subtitle: `${b.name} · Floor ${r.floor === 0 ? "G" : r.floor}`,
    buildingId: b.id,
    buildingName: b.name,
    floor: r.floor,
    category: r.category,
    type: r.type,
    accessible: r.accessible,
    hours: b.hours,
    keywords: `${r.name} ${r.type} ${b.name} ${b.code} ${r.category}`.toLowerCase(),
  };
});

export const destinations: Destination[] = [...roomDestinations, ...buildingDestinations];

export const destinationById = (id: string) => destinations.find((d) => d.id === id);
export const destinationForBuilding = (buildingId: string) =>
  destinations.find((d) => d.id === `b:${buildingId}`);

/** lightweight fuzzy subsequence scoring */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 0.1;
  if (haystack.includes(needle)) return 100 - haystack.indexOf(needle);
  let hi = 0;
  let score = 0;
  let streak = 0;
  for (const ch of needle) {
    const idx = haystack.indexOf(ch, hi);
    if (idx === -1) return -1;
    streak = idx === hi ? streak + 1 : 0;
    score += 2 + streak;
    hi = idx + 1;
  }
  return score / 4;
}

export function searchCampus(query: string, limit = 8): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return destinations.slice(0, limit);
  return destinations
    .map((d) => ({ d, s: fuzzyScore(d.keywords, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.d);
}

import { edges, nodeIndex, nodes, buildingById } from "@/lib/campus/data";
import type { CampusEdge, CampusNode } from "@/types/campus";

export type RouteMode = "fastest" | "accessible" | "avoid_construction" | "low_crowd";

export interface RouteStep {
  kind: "start" | "straight" | "left" | "right" | "elevator" | "stairs" | "arrive" | "enter";
  text: string;
  distance: number;
  nodeId: string;
  floor: number;
}

export interface RouteResult {
  mode: RouteMode;
  nodes: CampusNode[];
  distance: number;
  minutes: number;
  steps: RouteStep[];
  floorsCrossed: number[];
  usesElevator: boolean;
  usesStairs: boolean;
  crowdPeak: "low" | "moderate" | "high";
  summary: string[];
  blocked?: boolean;
}

const WALK_SPEED = 1.25; // m/s

const adjacency = new Map<string, { edge: CampusEdge; to: string }[]>();
for (const e of edges) {
  if (!adjacency.has(e.from)) adjacency.set(e.from, []);
  if (!adjacency.has(e.to)) adjacency.set(e.to, []);
  adjacency.get(e.from)!.push({ edge: e, to: e.to });
  adjacency.get(e.to)!.push({ edge: e, to: e.from });
}

function crowdPenalty(level: string) {
  return level === "high" ? 2.4 : level === "moderate" ? 1.35 : 1;
}

function weightFor(edge: CampusEdge, mode: RouteMode): number | null {
  if (mode === "accessible") {
    if (!edge.accessible || edge.stairs) return null;
    if (edge.construction) return null;
    return edge.distance * (edge.elevator ? 1.2 : 1);
  }
  if (mode === "avoid_construction" && edge.construction) return null;
  if (mode === "low_crowd") {
    if (edge.construction) return null;
    return edge.distance * crowdPenalty(edge.crowdLevel);
  }
  return edge.distance * (edge.construction ? 3.2 : 1) * (edge.stairs ? 1.1 : 1);
}

/** A* over the campus graph (euclidean + floor-aware heuristic). */
export function findPath(startId: string, goalId: string, mode: RouteMode): CampusNode[] | null {
  const goal = nodeIndex.get(goalId);
  const start = nodeIndex.get(startId);
  if (!start || !goal) return null;
  if (startId === goalId) return [start];

  const h = (n: CampusNode) => Math.hypot(n.x - goal.x, n.z - goal.z) + Math.abs(n.floor - goal.floor) * 12;

  const open = new Set<string>([startId]);
  const g = new Map<string, number>([[startId, 0]]);
  const f = new Map<string, number>([[startId, h(start)]]);
  const cameFrom = new Map<string, string>();

  while (open.size) {
    let current = "";
    let best = Infinity;
    for (const id of open) {
      const score = f.get(id) ?? Infinity;
      if (score < best) {
        best = score;
        current = id;
      }
    }
    if (current === goalId) {
      const path = [current];
      while (cameFrom.has(path[0]!)) path.unshift(cameFrom.get(path[0]!)!);
      return path.map((id) => nodeIndex.get(id)!);
    }
    open.delete(current);
    for (const { edge, to } of adjacency.get(current) ?? []) {
      const w = weightFor(edge, mode);
      if (w === null) continue;
      const tentative = (g.get(current) ?? Infinity) + w;
      if (tentative < (g.get(to) ?? Infinity)) {
        cameFrom.set(to, current);
        g.set(to, tentative);
        f.set(to, tentative + h(nodeIndex.get(to)!));
        open.add(to);
      }
    }
  }
  return null;
}

function edgeBetween(a: string, b: string) {
  return edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

function turnKind(prev: CampusNode, cur: CampusNode, next: CampusNode) {
  const a1 = Math.atan2(cur.z - prev.z, cur.x - prev.x);
  const a2 = Math.atan2(next.z - cur.z, next.x - cur.x);
  let d = ((a2 - a1) * 180) / Math.PI;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  if (d > 35) return "right" as const;
  if (d < -35) return "left" as const;
  return "straight" as const;
}

export function buildRoute(startId: string, goalId: string, mode: RouteMode): RouteResult | null {
  const path = findPath(startId, goalId, mode);
  if (!path || path.length < 1) return null;

  let distance = 0;
  const steps: RouteStep[] = [];
  const floors = new Set<number>([path[0]!.floor]);
  let usesElevator = false;
  let usesStairs = false;
  let crowdPeak: "low" | "moderate" | "high" = "low";
  const summary: string[] = [];

  const label = (n: CampusNode) =>
    n.label ?? (n.buildingId ? buildingById(n.buildingId)?.name : undefined) ?? "walkway";

  steps.push({
    kind: "start",
    text: `Start at ${label(path[0]!)}`,
    distance: 0,
    nodeId: path[0]!.id,
    floor: path[0]!.floor,
  });
  summary.push(label(path[0]!));

  let running = 0;
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]!;
    const cur = path[i]!;
    const e = edgeBetween(prev.id, cur.id);
    const seg = e?.distance ?? Math.hypot(prev.x - cur.x, prev.z - cur.z);
    distance += seg;
    running += seg;
    floors.add(cur.floor);
    if (e?.crowdLevel === "high") crowdPeak = "high";
    else if (e?.crowdLevel === "moderate" && crowdPeak === "low") crowdPeak = "moderate";

    if (e?.elevator) {
      usesElevator = true;
      steps.push({
        kind: "elevator",
        text: `Take the elevator to Floor ${cur.floor === 0 ? "G" : cur.floor}`,
        distance: Math.round(running),
        nodeId: cur.id,
        floor: cur.floor,
      });
      summary.push("Elevator");
      summary.push(`Floor ${cur.floor === 0 ? "G" : cur.floor}`);
      running = 0;
      continue;
    }
    if (e?.stairs) {
      usesStairs = true;
      steps.push({
        kind: "stairs",
        text: `Take the stairs to Floor ${cur.floor === 0 ? "G" : cur.floor}`,
        distance: Math.round(running),
        nodeId: cur.id,
        floor: cur.floor,
      });
      summary.push("Stairs");
      running = 0;
      continue;
    }
    if (cur.kind === "entrance" && prev.kind === "path") {
      steps.push({
        kind: "enter",
        text: `Enter ${label(cur)}`,
        distance: Math.round(running),
        nodeId: cur.id,
        floor: cur.floor,
      });
      summary.push(buildingById(cur.buildingId ?? "")?.code ?? label(cur));
      running = 0;
      continue;
    }
    const next = path[i + 1];
    if (next) {
      const t = turnKind(prev, cur, next);
      if (t !== "straight" && running > 12) {
        steps.push({
          kind: t,
          text: `Walk ${Math.round(running)} m, then turn ${t}`,
          distance: Math.round(running),
          nodeId: cur.id,
          floor: cur.floor,
        });
        running = 0;
      }
    }
  }

  const last = path[path.length - 1]!;
  if (running > 4) {
    steps.push({
      kind: "straight",
      text: `Continue straight for ${Math.round(running)} m`,
      distance: Math.round(running),
      nodeId: last.id,
      floor: last.floor,
    });
  }
  steps.push({
    kind: "arrive",
    text: `You have arrived at ${label(last)}`,
    distance: 0,
    nodeId: last.id,
    floor: last.floor,
  });
  summary.push(label(last));

  const minutes = Math.max(1, Math.round(distance / WALK_SPEED / 60));

  return {
    mode,
    nodes: path,
    distance: Math.round(distance),
    minutes,
    steps,
    floorsCrossed: Array.from(floors).sort(),
    usesElevator,
    usesStairs,
    crowdPeak,
    summary: summary.filter((s, i, arr) => s !== arr[i - 1]),
  };
}

export const routeModes: { id: RouteMode; label: string }[] = [
  { id: "fastest", label: "Fastest Route" },
  { id: "accessible", label: "Accessible Route" },
  { id: "low_crowd", label: "Low Crowd Route" },
  { id: "avoid_construction", label: "Avoid Construction" },
];

export function nearestNode(x: number, z: number, floor = 0) {
  let best: CampusNode | null = null;
  let bestD = Infinity;
  for (const n of nodes) {
    if (n.floor !== floor) continue;
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

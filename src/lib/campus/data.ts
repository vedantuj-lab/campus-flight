import type {
  Building,
  CampusEdge,
  CampusNode,
  ConstructionZone,
  CrowdLevel,
  Landmark,
  Room,
  ScheduleEntry,
} from "@/types/campus";

export const CAMPUS_NAME = "Nova Institute of Technology";
export const CAMPUS_ORIGIN = { latitude: 19.0435, longitude: 73.0234 };
/** metres per degree, used for the local <-> geo projection */
const M_PER_DEG_LAT = 111_320;

export function localToGeo(x: number, z: number) {
  const latitude = CAMPUS_ORIGIN.latitude + -z / M_PER_DEG_LAT;
  const longitude =
    CAMPUS_ORIGIN.longitude +
    x / (M_PER_DEG_LAT * Math.cos((CAMPUS_ORIGIN.latitude * Math.PI) / 180));
  return { latitude, longitude };
}

export function geoToLocal(latitude: number, longitude: number) {
  const z = -(latitude - CAMPUS_ORIGIN.latitude) * M_PER_DEG_LAT;
  const x =
    (longitude - CAMPUS_ORIGIN.longitude) *
    M_PER_DEG_LAT *
    Math.cos((CAMPUS_ORIGIN.latitude * Math.PI) / 180);
  return { x, z };
}

type BuildingSeed = Omit<Building, "latitude" | "longitude">;

const buildingSeeds: BuildingSeed[] = [
  {
    id: "gate",
    name: "Main Gate",
    code: "GATE",
    type: "Entrance",
    category: "transport",
    floors: 1,
    x: 0,
    z: 168,
    width: 44,
    depth: 8,
    height: 9,
    accent: "#38bdf8",
    accessibility: true,
    hours: "Open 24 hours",
  },
  {
    id: "admin",
    name: "Administration Building",
    code: "AD",
    type: "Administration",
    category: "administration",
    floors: 3,
    x: -70,
    z: 96,
    width: 58,
    depth: 34,
    height: 24,
    accent: "#a78bfa",
    accessibility: true,
    hours: "9:00 AM – 5:00 PM",
    rooms: 18,
  },
  {
    id: "ce",
    name: "Computer Engineering Block",
    code: "CE",
    type: "Academic",
    category: "academic",
    floors: 3,
    x: 72,
    z: 40,
    width: 74,
    depth: 40,
    height: 30,
    accent: "#22d3ee",
    accessibility: true,
    hours: "7:00 AM – 9:00 PM",
    rooms: 12,
    labs: 4,
  },
  {
    id: "science",
    name: "Science Block",
    code: "SC",
    type: "Academic",
    category: "academic",
    floors: 3,
    x: -76,
    z: 12,
    width: 66,
    depth: 38,
    height: 27,
    accent: "#818cf8",
    accessibility: true,
    hours: "8:00 AM – 7:00 PM",
    rooms: 14,
    labs: 6,
  },
  {
    id: "library",
    name: "Central Library",
    code: "LIB",
    type: "Academic",
    category: "academic",
    floors: 2,
    x: 4,
    z: 4,
    width: 52,
    depth: 44,
    height: 22,
    accent: "#34d399",
    accessibility: true,
    hours: "Open until 8:00 PM",
    rooms: 8,
  },
  {
    id: "audi",
    name: "Grand Auditorium",
    code: "AUD",
    type: "Events",
    category: "recreation",
    floors: 2,
    x: 96,
    z: 128,
    width: 62,
    depth: 46,
    height: 26,
    accent: "#f472b6",
    accessibility: true,
    hours: "Event based",
    rooms: 4,
  },
  {
    id: "canteen",
    name: "Campus Canteen",
    code: "CAN",
    type: "Food Court",
    category: "food",
    floors: 1,
    x: -20,
    z: -70,
    width: 54,
    depth: 30,
    height: 13,
    accent: "#fbbf24",
    accessibility: true,
    hours: "8:00 AM – 10:00 PM",
    rooms: 3,
  },
  {
    id: "hostel",
    name: "Aurora Hostel",
    code: "HST",
    type: "Residence",
    category: "residence",
    floors: 4,
    x: -120,
    z: -96,
    width: 44,
    depth: 60,
    height: 36,
    accent: "#60a5fa",
    accessibility: true,
    hours: "Residents only",
    rooms: 60,
  },
  {
    id: "medical",
    name: "Medical Center",
    code: "MED",
    type: "Healthcare",
    category: "emergency",
    floors: 1,
    x: 84,
    z: -52,
    width: 40,
    depth: 28,
    height: 14,
    accent: "#f87171",
    accessibility: true,
    hours: "Open 24 hours",
    rooms: 6,
  },
  {
    id: "sports",
    name: "Sports Complex & Ground",
    code: "SPT",
    type: "Sports",
    category: "sports",
    floors: 1,
    x: 108,
    z: -132,
    width: 96,
    depth: 62,
    height: 12,
    accent: "#4ade80",
    accessibility: true,
    hours: "6:00 AM – 9:00 PM",
    rooms: 5,
  },
  {
    id: "parking",
    name: "North Parking Deck",
    code: "PRK",
    type: "Parking",
    category: "transport",
    floors: 2,
    x: -132,
    z: 128,
    width: 70,
    depth: 44,
    height: 11,
    accent: "#94a3b8",
    accessibility: true,
    hours: "Open 24 hours",
  },
  {
    id: "workshop",
    name: "Innovation Workshop",
    code: "WS",
    type: "Laboratory",
    category: "academic",
    floors: 2,
    x: 148,
    z: -8,
    width: 42,
    depth: 34,
    height: 18,
    accent: "#2dd4bf",
    accessibility: true,
    hours: "9:00 AM – 8:00 PM",
    labs: 5,
  },
  {
    id: "busstop",
    name: "Campus Bus Stop",
    code: "BUS",
    type: "Transport",
    category: "transport",
    floors: 1,
    x: -152,
    z: 40,
    width: 26,
    depth: 10,
    height: 7,
    accent: "#38bdf8",
    accessibility: true,
    hours: "6:00 AM – 11:00 PM",
  },
];

export const buildings: Building[] = buildingSeeds.map((b) => ({
  ...b,
  ...localToGeo(b.x, b.z),
}));

export const buildingById = (id: string) => buildings.find((b) => b.id === id);

/* ------------------------------------------------------------------ rooms */

function room(
  name: string,
  building: string,
  floor: number,
  type: string,
  category: Room["category"] = "academic",
  capacity?: number,
  accessible = true,
): Room {
  return {
    id: `${building}-${name}`.toLowerCase().replace(/\s+/g, "-"),
    name,
    building,
    floor,
    type,
    category,
    capacity,
    accessible,
  };
}

export const rooms: Room[] = [
  room("B101", "ce", 0, "Lecture Hall", "academic", 90),
  room("B102", "ce", 0, "Lecture Hall", "academic", 60),
  room("B103", "ce", 0, "Reception", "administration"),
  room("B201", "ce", 2, "Seminar Room", "academic", 40),
  room("B204", "ce", 2, "Lecture Hall", "academic", 120),
  room("B205", "ce", 2, "Faculty Room", "administration"),
  room("B301", "ce", 3, "Project Studio", "academic", 35),
  room("B302", "ce", 3, "Research Lab", "academic", 30),
  room("CE Computer Lab 1", "ce", 1, "Computer Lab", "academic", 60),
  room("CE Computer Lab 2", "ce", 1, "Computer Lab", "academic", 60),
  room("AI & Robotics Lab", "ce", 1, "Laboratory", "academic", 40),
  room("Networking Lab C103", "ce", 1, "Laboratory", "academic", 45),
  room("CE Washroom (Accessible)", "ce", 0, "Washroom", "accessibility", undefined, true),
  room("A301", "science", 3, "Lecture Hall", "academic", 80),
  room("A201", "science", 2, "Physics Lab", "academic", 40),
  room("A202", "science", 2, "Chemistry Lab", "academic", 40),
  room("A101", "science", 1, "Biology Lab", "academic", 35),
  room("A102", "science", 1, "Lecture Hall", "academic", 70),
  room("Science Washroom", "science", 0, "Washroom", "accessibility"),
  room("Reading Hall", "library", 1, "Study Space", "academic", 180),
  room("Digital Archive", "library", 2, "Study Space", "academic", 60),
  room("Silent Zone", "library", 2, "Study Space", "academic", 40),
  room("Library Help Desk", "library", 0, "Service Desk", "administration"),
  room("Registrar Office", "admin", 1, "Office", "administration"),
  room("Examination Cell", "admin", 2, "Office", "administration"),
  room("Accounts Office", "admin", 2, "Office", "administration"),
  room("Placement Cell", "admin", 3, "Office", "administration"),
  room("Main Stage", "audi", 0, "Auditorium", "recreation", 900),
  room("Green Room", "audi", 1, "Backstage", "recreation"),
  room("Food Court", "canteen", 0, "Dining", "food", 260),
  room("Coffee Bar", "canteen", 0, "Cafe", "food", 40),
  room("Emergency Ward", "medical", 0, "Clinic", "emergency"),
  room("Pharmacy", "medical", 0, "Pharmacy", "emergency"),
  room("Fabrication Lab", "workshop", 0, "Laboratory", "academic", 30),
  room("Drone Lab", "workshop", 1, "Laboratory", "academic", 25),
  room("Gymnasium", "sports", 0, "Gym", "sports", 120),
  room("Indoor Court", "sports", 0, "Court", "sports", 200),
];

/* -------------------------------------------------------------- landmarks */

const landmarkList: Landmark[] = [];
let lmId = 0;
const push = (kind: Landmark["kind"], x: number, z: number) =>
  landmarkList.push({ id: `lm-${lmId++}`, name: kind, kind, x, z });

// tree avenues
for (let i = -7; i <= 7; i++) {
  if (Math.abs(i) < 1) continue;
  push("tree", -26, i * 22);
  push("tree", 34, i * 22);
}
for (let i = -6; i <= 6; i += 2) {
  push("tree", i * 26, 150);
  push("tree", i * 26, -160);
}
// street lights along the main axis
for (let i = -4; i <= 4; i++) {
  push("light", -14, i * 38);
  push("light", 22, i * 38);
}
// benches in the garden
(
  [
    [-10, 62],
    [14, 62],
    [-10, -20],
    [14, -20],
    [-46, -140],
    [-16, -140],
  ] as [number, number][]
).forEach(([x, z]) => push("bench", x, z));
push("gate", 0, 168);
push("monument", 4, 62);
push("fountain", 4, -26);
push("busstop", -152, 40);

export const landmarks: Landmark[] = landmarkList;

/* ------------------------------------------------------- construction */

export const constructionZones: ConstructionZone[] = [
  {
    id: "cz-1",
    name: "Central Walkway Resurfacing",
    status: "active",
    x: 40,
    z: 80,
    radius: 26,
    startDate: "2026-08-01",
    endDate: "2026-09-15",
  },
  {
    id: "cz-2",
    name: "Science Block Facade Works",
    status: "active",
    x: -80,
    z: -40,
    radius: 22,
    startDate: "2026-07-20",
    endDate: "2026-08-30",
  },
  {
    id: "cz-3",
    name: "New Sports Pavilion",
    status: "planned",
    x: 160,
    z: -160,
    radius: 24,
    startDate: "2026-10-01",
    endDate: "2027-02-01",
  },
  {
    id: "cz-4",
    name: "East Drainage Line",
    status: "cleared",
    x: 140,
    z: 96,
    radius: 18,
    startDate: "2026-05-10",
    endDate: "2026-07-01",
  },
];

/* ------------------------------------------------------------ graph */

const GRID = 40;
const EXTENT = 160;

function seededCrowd(x: number, z: number): CrowdLevel {
  const v = Math.abs(Math.sin(x * 0.031 + z * 0.017) * 43758.5453) % 1;
  if (v > 0.82) return "high";
  if (v > 0.55) return "moderate";
  return "low";
}

const nodeMap = new Map<string, CampusNode>();
const edgeList: CampusEdge[] = [];

function addNode(n: CampusNode) {
  nodeMap.set(n.id, n);
  return n;
}

function connect(
  a: string,
  b: string,
  opts: Partial<Omit<CampusEdge, "from" | "to" | "distance">> = {},
) {
  const na = nodeMap.get(a);
  const nb = nodeMap.get(b);
  if (!na || !nb) return;
  const planar = Math.hypot(na.x - nb.x, na.z - nb.z);
  const vertical = Math.abs(na.floor - nb.floor) * 12;
  const distance = Math.round((planar + vertical) * 10) / 10;
  edgeList.push({
    from: a,
    to: b,
    distance,
    accessible: opts.accessible ?? true,
    stairs: opts.stairs ?? false,
    elevator: opts.elevator ?? false,
    construction: opts.construction ?? false,
    crowdLevel:
      opts.crowdLevel ??
      (na.crowd === "high" || nb.crowd === "high"
        ? "high"
        : na.crowd === "moderate" || nb.crowd === "moderate"
          ? "moderate"
          : "low"),
  });
}

function inConstruction(x: number, z: number) {
  return constructionZones.some(
    (c) => c.status === "active" && Math.hypot(c.x - x, c.z - z) < c.radius,
  );
}

// outdoor walkway grid (9 x 9 = 81 nodes)
for (let ix = -EXTENT; ix <= EXTENT; ix += GRID) {
  for (let iz = -EXTENT; iz <= EXTENT; iz += GRID) {
    addNode({
      id: `p_${ix}_${iz}`,
      x: ix,
      z: iz,
      floor: 0,
      kind: "path",
      crowd: seededCrowd(ix, iz),
    });
  }
}
for (let ix = -EXTENT; ix <= EXTENT; ix += GRID) {
  for (let iz = -EXTENT; iz <= EXTENT; iz += GRID) {
    const here = `p_${ix}_${iz}`;
    const right = `p_${ix + GRID}_${iz}`;
    const down = `p_${ix}_${iz + GRID}`;
    const construction = inConstruction(ix, iz);
    if (nodeMap.has(right))
      connect(here, right, {
        construction: construction || inConstruction(ix + GRID, iz),
      });
    if (nodeMap.has(down))
      connect(here, down, {
        construction: construction || inConstruction(ix, iz + GRID),
      });
  }
}

function nearestGridId(x: number, z: number) {
  const gx = Math.max(-EXTENT, Math.min(EXTENT, Math.round(x / GRID) * GRID));
  const gz = Math.max(-EXTENT, Math.min(EXTENT, Math.round(z / GRID) * GRID));
  return `p_${gx}_${gz}`;
}

// building entrances
for (const b of buildings) {
  const entranceZ = b.z + b.depth / 2 + 6;
  addNode({
    id: `e_${b.id}`,
    x: b.x,
    z: entranceZ,
    floor: 0,
    kind: "entrance",
    buildingId: b.id,
    label: `${b.name} Entrance`,
    crowd: seededCrowd(b.x, entranceZ),
  });
  connect(`e_${b.id}`, nearestGridId(b.x, entranceZ));
  connect(`e_${b.id}`, nearestGridId(b.x + GRID, entranceZ));
}

// indoor vertical cores + per-floor corridors for multi-floor buildings
const indoorBuildings = buildings.filter((b) => b.floors > 1);
for (const b of indoorBuildings) {
  for (let f = 0; f < b.floors + (b.floors > 2 ? 1 : 0); f++) {
    if (f > 3) break;
    const lobby = addNode({
      id: `i_${b.id}_${f}_lobby`,
      x: b.x,
      z: b.z + b.depth / 4,
      floor: f,
      kind: "indoor",
      buildingId: b.id,
      label: `${b.code} Floor ${f} Lobby`,
      crowd: seededCrowd(b.x + f * 7, b.z),
    });
    const corridor = addNode({
      id: `i_${b.id}_${f}_corridor`,
      x: b.x - b.width / 4,
      z: b.z - b.depth / 6,
      floor: f,
      kind: "indoor",
      buildingId: b.id,
      label: `${b.code} Floor ${f} Corridor`,
      crowd: seededCrowd(b.x - f * 5, b.z + 3),
    });
    const elevator = addNode({
      id: `i_${b.id}_${f}_elevator`,
      x: b.x + b.width / 4,
      z: b.z,
      floor: f,
      kind: "elevator",
      buildingId: b.id,
      label: `${b.code} Elevator · Floor ${f}`,
      crowd: "low",
    });
    const stairs = addNode({
      id: `i_${b.id}_${f}_stairs`,
      x: b.x - b.width / 3,
      z: b.z + b.depth / 6,
      floor: f,
      kind: "stairs",
      buildingId: b.id,
      label: `${b.code} Stairwell · Floor ${f}`,
      crowd: "moderate",
    });
    connect(lobby.id, corridor.id);
    connect(lobby.id, elevator.id);
    connect(lobby.id, stairs.id);
    connect(corridor.id, stairs.id);
    if (f === 0) connect(`e_${b.id}`, lobby.id);
    if (f > 0) {
      connect(`i_${b.id}_${f - 1}_elevator`, elevator.id, {
        elevator: true,
        accessible: true,
      });
      connect(`i_${b.id}_${f - 1}_stairs`, stairs.id, {
        stairs: true,
        accessible: false,
      });
    }
  }
}

// rooms become graph nodes attached to their floor corridor
for (const r of rooms) {
  const b = buildingById(r.building);
  if (!b) continue;
  const hasIndoor = nodeMap.has(`i_${b.id}_${r.floor}_corridor`);
  const anchor = hasIndoor ? `i_${b.id}_${r.floor}_corridor` : `e_${b.id}`;
  const idx = rooms.filter((x) => x.building === r.building && x.floor === r.floor).indexOf(r);
  const node = addNode({
    id: `r_${r.id}`,
    x: b.x - b.width / 4 + ((idx % 4) * b.width) / 6,
    z: b.z - b.depth / 6 - 6 - Math.floor(idx / 4) * 6,
    floor: hasIndoor ? r.floor : 0,
    kind: "indoor",
    buildingId: b.id,
    label: r.name,
    crowd: seededCrowd(b.x + idx * 11, b.z + r.floor * 9),
  });
  connect(node.id, anchor);
}

export const nodes: CampusNode[] = Array.from(nodeMap.values());
export const edges: CampusEdge[] = edgeList;
export const nodeIndex = nodeMap;

/**
 * Recomputes the `construction` flag on every outdoor edge from the given
 * zones. Called whenever an admin adds, clears or removes a zone so routing
 * reacts immediately.
 */
export function applyConstructionZones(zones: ConstructionZone[]) {
  const blocked = (x: number, z: number) =>
    zones.some((c) => c.status === "active" && Math.hypot(c.x - x, c.z - z) < c.radius);
  for (const edge of edgeList) {
    const a = nodeMap.get(edge.from);
    const b = nodeMap.get(edge.to);
    if (!a || !b) continue;
    if (a.kind === "elevator" || b.kind === "elevator" || a.floor > 0 || b.floor > 0) continue;
    edge.construction = blocked(a.x, a.z) || blocked(b.x, b.z);
  }
}

/* --------------------------------------------------------- campus events */

export const campusEvents = [
  {
    id: "ev-1",
    title: "TechNova Hackathon Finals",
    buildingId: "audi",
    startsAt: "09:00 AM",
    endsAt: "06:00 PM",
    audience: "All students",
  },
  {
    id: "ev-2",
    title: "Placement Drive — Cloud Systems",
    buildingId: "admin",
    startsAt: "10:30 AM",
    endsAt: "02:00 PM",
    audience: "Final year",
  },
  {
    id: "ev-3",
    title: "Robotics Open Lab",
    buildingId: "workshop",
    startsAt: "03:00 PM",
    endsAt: "07:00 PM",
    audience: "Open campus",
  },
];

/* --------------------------------------------------------- crowd data */

export const crowdData: { id: string; name: string; level: CrowdLevel; occupancy: number }[] = [
  { id: "library", name: "Central Library", level: "low", occupancy: 34 },
  { id: "canteen", name: "Campus Canteen", level: "high", occupancy: 92 },
  { id: "gate", name: "Main Gate", level: "moderate", occupancy: 61 },
  { id: "ce", name: "Computer Engineering Block", level: "low", occupancy: 41 },
  { id: "science", name: "Science Block", level: "moderate", occupancy: 58 },
  { id: "audi", name: "Grand Auditorium", level: "low", occupancy: 12 },
  { id: "sports", name: "Sports Complex", level: "moderate", occupancy: 55 },
  { id: "admin", name: "Administration Building", level: "low", occupancy: 22 },
];

/* ------------------------------------------------------------ schedule */

export const schedule: ScheduleEntry[] = [
  {
    id: "s1",
    time: "09:00 AM",
    minutesFromMidnight: 540,
    subject: "Data Structures",
    roomId: "ce-b204",
    faculty: "Dr. A. Mehta",
  },
  {
    id: "s2",
    time: "11:00 AM",
    minutesFromMidnight: 660,
    subject: "Database Management",
    roomId: "ce-networking-lab-c103",
    faculty: "Prof. S. Nair",
  },
  {
    id: "s3",
    time: "01:00 PM",
    minutesFromMidnight: 780,
    subject: "Operating Systems Lab",
    roomId: "ce-ce-computer-lab-1",
    faculty: "Prof. R. Iyer",
  },
  {
    id: "s4",
    time: "02:00 PM",
    minutesFromMidnight: 840,
    subject: "Computer Networks",
    roomId: "science-a301",
    faculty: "Dr. K. Rao",
  },
  {
    id: "s5",
    time: "04:00 PM",
    minutesFromMidnight: 960,
    subject: "Robotics Seminar",
    roomId: "ce-b201",
    faculty: "Dr. P. Shah",
  },
];

export const defaultFavorites = [
  "ce-b204",
  "ce-ce-computer-lab-1",
  "b:library",
  "b:canteen",
  "b:gate",
];

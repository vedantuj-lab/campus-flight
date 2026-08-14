export type CrowdLevel = "low" | "moderate" | "high";

export type PlaceCategory =
  | "academic"
  | "food"
  | "emergency"
  | "transport"
  | "sports"
  | "administration"
  | "accessibility"
  | "residence"
  | "recreation";

export interface Building {
  id: string;
  name: string;
  code: string;
  type: string;
  category: PlaceCategory;
  floors: number;
  /** metres, campus-local coordinates */
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  accent: string;
  accessibility: boolean;
  latitude: number;
  longitude: number;
  hours: string;
  labs?: number | undefined;
  rooms?: number | undefined;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  type: string;
  category: PlaceCategory;
  capacity?: number | undefined;
  accessible: boolean;
}

export interface Landmark {
  id: string;
  name: string;
  kind: "tree" | "light" | "bench" | "gate" | "monument" | "busstop" | "fountain";
  x: number;
  z: number;
  rotation?: number | undefined;
}

export interface CampusNode {
  id: string;
  x: number;
  z: number;
  floor: number;
  label?: string | undefined;
  kind: "path" | "entrance" | "indoor" | "elevator" | "stairs" | "junction";
  buildingId?: string | undefined;
  crowd: CrowdLevel;
}

export interface CampusEdge {
  from: string;
  to: string;
  distance: number;
  accessible: boolean;
  stairs: boolean;
  elevator: boolean;
  construction: boolean;
  crowdLevel: CrowdLevel;
}

export interface ConstructionZone {
  id: string;
  name: string;
  status: "active" | "planned" | "cleared";
  x: number;
  z: number;
  radius: number;
  startDate: string;
  endDate: string;
}

export interface ScheduleEntry {
  id: string;
  time: string;
  minutesFromMidnight: number;
  subject: string;
  roomId: string;
  faculty: string;
}

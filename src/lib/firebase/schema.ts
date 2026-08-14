import type { Building, ConstructionZone, CrowdLevel, Room, ScheduleEntry } from "@/types/campus";

/**
 * Firestore collection names. Every document type below mirrors the shape the
 * app reads today, so the local repository can be swapped for Firestore
 * without touching UI code.
 */
export const collections = {
  users: "users",
  buildings: "buildings",
  floors: "floors",
  rooms: "rooms",
  places: "places",
  paths: "paths",
  routes: "routes",
  constructionZones: "constructionZones",
  crowdData: "crowdData",
  events: "events",
  favorites: "favorites",
  navigationSessions: "navigationSessions",
} as const;

export type CollectionName = (typeof collections)[keyof typeof collections];

export type RouteMode = "fastest" | "accessible" | "avoid_construction" | "low_crowd";
export type Units = "metric" | "imperial";
export type Theme = "dark" | "light";

export interface UserProfileDoc {
  id: string;
  name: string;
  email: string;
  program: string;
  role: "student" | "faculty" | "staff" | "visitor" | "admin";
  defaultRouteMode: RouteMode;
  accessibilityPreference: boolean;
  units: Units;
  theme: Theme;
  reducedMotion: boolean;
}

export interface FavoriteDoc {
  id: string;
  userId: string;
  destinationId: string;
  createdAt: number;
}

export interface CrowdDoc {
  id: string;
  name: string;
  level: CrowdLevel;
  occupancy: number;
  updatedAt: number;
  source: "sensor" | "simulated" | "manual";
}

export interface CampusEventDoc {
  id: string;
  title: string;
  buildingId: string;
  startsAt: string;
  endsAt: string;
  audience: string;
}

export interface PlaceDoc {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  type: string;
  category: Room["category"];
  accessible: boolean;
  hours: string;
}

export interface NavigationSessionDoc {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  mode: RouteMode;
  distance: number;
  minutes: number;
  startedAt: number;
  completedAt?: number;
}

export interface CampusSnapshot {
  buildings: Building[];
  rooms: Room[];
  places: PlaceDoc[];
  constructionZones: ConstructionZone[];
  crowd: CrowdDoc[];
  events: CampusEventDoc[];
  schedule: ScheduleEntry[];
  profile: UserProfileDoc;
  favorites: string[];
  recents: string[];
  sessions: NavigationSessionDoc[];
}

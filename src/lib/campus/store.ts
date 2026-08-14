import { useCallback, useSyncExternalStore } from "react";
import {
  applyConstructionZones,
  buildings,
  campusEvents as seedEvents,
  constructionZones as seedZones,
  crowdData as seedCrowd,
  defaultFavorites,
  rooms,
} from "@/lib/campus/data";
import { getRepository } from "@/lib/firebase/repository";
import { collections } from "@/lib/firebase/schema";
import type {
  CampusEventDoc,
  CrowdDoc,
  NavigationSessionDoc,
  PlaceDoc,
  UserProfileDoc,
} from "@/lib/firebase/schema";
import type { ConstructionZone, CrowdLevel } from "@/types/campus";

export interface CampusState {
  zones: ConstructionZone[];
  crowd: CrowdDoc[];
  places: PlaceDoc[];
  events: CampusEventDoc[];
  profile: UserProfileDoc;
  favorites: string[];
  recents: string[];
  sessions: NavigationSessionDoc[];
}

const repo = getRepository();

const defaultProfile: UserProfileDoc = {
  id: "u_demo",
  name: "Vedant Dalvi",
  email: "vedant@nova.edu",
  program: "Computer Engineering, Sem 6",
  role: "student",
  defaultRouteMode: "fastest",
  accessibilityPreference: false,
  units: "metric",
  theme: "dark",
  reducedMotion: false,
};

const seedCrowdDocs: CrowdDoc[] = seedCrowd.map((c) => ({
  ...c,
  updatedAt: Date.now(),
  source: "simulated" as const,
}));

/** Extra places an admin adds on top of the seeded rooms. */
const seedPlaces: PlaceDoc[] = [];

function initialState(): CampusState {
  return {
    zones: repo.read(collections.constructionZones, seedZones),
    crowd: repo.read(collections.crowdData, seedCrowdDocs),
    places: repo.read(collections.places, seedPlaces),
    events: repo.read(collections.events, seedEvents),
    profile: { ...defaultProfile, ...repo.read(collections.users, {}) },
    favorites: repo.read(collections.favorites, defaultFavorites),
    recents: repo.read(collections.routes, ["b:library", "ce-b204"]),
    sessions: repo.read(collections.navigationSessions, [] as NavigationSessionDoc[]),
  };
}

let state: CampusState = initialState();
applyConstructionZones(state.zones);

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function set(patch: Partial<CampusState>) {
  state = { ...state, ...patch };
  emit();
}

export const campusStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /* ----------------------------------------------------- construction */
  saveZone(zone: ConstructionZone) {
    const zones = state.zones.some((z) => z.id === zone.id)
      ? state.zones.map((z) => (z.id === zone.id ? zone : z))
      : [...state.zones, zone];
    applyConstructionZones(zones);
    repo.write(collections.constructionZones, zones);
    set({ zones });
  },
  removeZone(id: string) {
    const zones = state.zones.filter((z) => z.id !== id);
    applyConstructionZones(zones);
    repo.write(collections.constructionZones, zones);
    set({ zones });
  },

  /* ------------------------------------------------------------ crowd */
  setCrowd(
    id: string,
    level: CrowdLevel,
    occupancy: number,
    source: CrowdDoc["source"] = "manual",
  ) {
    const crowd = state.crowd.map((c) =>
      c.id === id ? { ...c, level, occupancy, source, updatedAt: Date.now() } : c,
    );
    repo.write(collections.crowdData, crowd);
    set({ crowd });
  },
  /** simulated sensor tick — never overwrites a manual admin override */
  tickCrowd() {
    const crowd = state.crowd.map((c) => {
      if (c.source === "manual" && Date.now() - c.updatedAt < 60_000) return c;
      const occupancy = Math.max(
        5,
        Math.min(99, c.occupancy + Math.round((Math.random() - 0.45) * 9)),
      );
      const level: CrowdLevel = occupancy > 75 ? "high" : occupancy > 45 ? "moderate" : "low";
      return { ...c, occupancy, level, source: "simulated" as const, updatedAt: Date.now() };
    });
    set({ crowd });
  },

  /* ----------------------------------------------------------- places */
  addPlace(place: PlaceDoc) {
    const places = [...state.places, place];
    repo.write(collections.places, places);
    set({ places });
  },
  removePlace(id: string) {
    const places = state.places.filter((p) => p.id !== id);
    repo.write(collections.places, places);
    set({ places });
  },

  /* ----------------------------------------------------------- events */
  addEvent(event: CampusEventDoc) {
    const events = [...state.events, event];
    repo.write(collections.events, events);
    set({ events });
  },
  removeEvent(id: string) {
    const events = state.events.filter((e) => e.id !== id);
    repo.write(collections.events, events);
    set({ events });
  },

  /* ---------------------------------------------------------- profile */
  updateProfile(patch: Partial<UserProfileDoc>) {
    const profile = { ...state.profile, ...patch };
    repo.write(collections.users, profile);
    set({ profile });
  },

  /* -------------------------------------------------------- favorites */
  toggleFavorite(destinationId: string) {
    const favorites = state.favorites.includes(destinationId)
      ? state.favorites.filter((f) => f !== destinationId)
      : [...state.favorites, destinationId];
    repo.write(collections.favorites, favorites);
    set({ favorites });
  },
  pushRecent(destinationId: string) {
    const recents = [destinationId, ...state.recents.filter((r) => r !== destinationId)].slice(
      0,
      8,
    );
    repo.write(collections.routes, recents);
    set({ recents });
  },

  /* ------------------------------------------------- navigation sessions */
  startSession(session: NavigationSessionDoc) {
    const sessions = [session, ...state.sessions].slice(0, 40);
    repo.write(collections.navigationSessions, sessions);
    set({ sessions });
  },
  completeSession(id: string) {
    const sessions = state.sessions.map((s) =>
      s.id === id ? { ...s, completedAt: Date.now() } : s,
    );
    repo.write(collections.navigationSessions, sessions);
    set({ sessions });
  },

  reset() {
    [
      collections.constructionZones,
      collections.crowdData,
      collections.places,
      collections.events,
      collections.users,
      collections.favorites,
      collections.routes,
      collections.navigationSessions,
    ].forEach((c) => repo.clear(c));
    state = initialState();
    applyConstructionZones(state.zones);
    emit();
  },
};

export function useCampusStore<T>(selector: (s: CampusState) => T): T {
  const get = useCallback(() => selector(campusStore.getState()), [selector]);
  return useSyncExternalStore(campusStore.subscribe, get, get);
}

/** buildings + admin-added places, used by the places directory and search */
export const buildingCount = buildings.length;
export const roomCount = rooms.length;

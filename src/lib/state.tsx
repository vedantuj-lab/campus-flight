import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buildRoute, nearestNode, type RouteMode, type RouteResult } from "@/lib/routing/engine";
import { buildings, geoToLocal, localToGeo, nodeIndex } from "@/lib/campus/data";
import { campusStore, useCampusStore } from "@/lib/campus/store";
import { destinationById, destinationForBuilding, type Destination } from "@/lib/campus/search";
import { formatDistance } from "@/lib/format";
import type { UserProfileDoc } from "@/lib/firebase/schema";
import type { ConstructionZone, CrowdLevel } from "@/types/campus";

export type NavState =
  | "IDLE"
  | "LOCATING"
  | "DESTINATION_SELECTED"
  | "ROUTE_CALCULATING"
  | "ROUTE_READY"
  | "NAVIGATING"
  | "FLOOR_CHANGE"
  | "ARRIVED"
  | "GPS_UNAVAILABLE"
  | "INDOOR_MODE";

export interface UserPosition {
  x: number;
  z: number;
  floor: number;
  accuracy: number;
  heading: number;
}

interface NavigatorContextValue {
  navState: NavState;
  user: UserPosition;
  gpsMessage: string;
  gpsLive: boolean;
  demoMode: boolean;
  indoorMode: boolean;
  toggleDemoMode: () => void;
  requestGps: () => void;
  destination: Destination | null;
  selectDestination: (d: Destination | null) => void;
  selectBuilding: (buildingId: string) => void;
  hoveredBuilding: string | null;
  setHoveredBuilding: (id: string | null) => void;
  selectedBuilding: string | null;
  setSelectedBuilding: (id: string | null) => void;
  mode: RouteMode;
  setMode: (m: RouteMode) => void;
  route: RouteResult | null;
  alternatives: RouteResult[];
  startNavigation: () => void;
  stopNavigation: () => void;
  progress: number;
  currentStep: number;
  activeFloor: number;
  setActiveFloor: (f: number) => void;
  showCrowd: boolean;
  setShowCrowd: (v: boolean) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  recents: string[];
  crowdFor: (buildingId: string) => { level: CrowdLevel; occupancy: number };
  zones: ConstructionZone[];
  profile: UserProfileDoc;
  updateProfile: (patch: Partial<UserProfileDoc>) => void;
  formatLength: (metres: number) => string;
  startLocations: { id: string; name: string }[];
  startLocationId: string;
  setStartLocation: (buildingId: string) => void;
  demoCaption: string | null;
  demoStep: number;
  demoTotal: number;
  simulateDrift: boolean;
  setSimulateDrift: (v: boolean) => void;
  cameraCommand: {
    type: "focus" | "top" | "iso" | "gps" | "fly" | "zoom";
    payload?: unknown;
    n: number;
  } | null;
  sendCamera: (type: "focus" | "top" | "iso" | "gps" | "fly" | "zoom", payload?: unknown) => void;
  runDemoScenario: () => void;
  error: string | null;
}

const Ctx = createContext<NavigatorContextValue | null>(null);

const START_NODE = "e_gate";

const selectZones = (s: { zones: ConstructionZone[] }) => s.zones;
const selectCrowd = (s: ReturnType<typeof campusStore.getState>) => s.crowd;
const selectProfile = (s: ReturnType<typeof campusStore.getState>) => s.profile;
const selectFavorites = (s: ReturnType<typeof campusStore.getState>) => s.favorites;
const selectRecents = (s: ReturnType<typeof campusStore.getState>) => s.recents;

/** predefined demo starting points offered by Demo Mode */
export const START_LOCATIONS = ["gate", "parking", "hostel", "busstop", "canteen", "library"].map(
  (id) => ({ id, name: buildings.find((b) => b.id === id)?.name ?? id }),
);

interface DemoBeat {
  at: number;
  caption: string;
  run?: () => void;
}

/** number of beats in the guided hackathon demo */
const DEMO_BEATS = 9;

export function NavigatorProvider({ children }: { children: ReactNode }) {
  const startNode = nodeIndex.get(START_NODE)!;
  const [user, setUser] = useState<UserPosition>({
    x: startNode.x,
    z: startNode.z,
    floor: 0,
    accuracy: 6.5,
    heading: 180,
  });
  const [navState, setNavState] = useState<NavState>("IDLE");
  const [gpsMessage, setGpsMessage] = useState("Demo campus position active");
  const [gpsLive, setGpsLive] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [indoorMode, setIndoorMode] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [mode, setModeState] = useState<RouteMode>("fastest");
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [alternatives, setAlternatives] = useState<RouteResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeFloor, setActiveFloor] = useState(0);
  const [showCrowd, setShowCrowd] = useState(false);
  const favorites = useCampusStore(selectFavorites);
  const recents = useCampusStore(selectRecents);
  const crowd = useCampusStore(selectCrowd);
  const zones = useCampusStore(selectZones);
  const profile = useCampusStore(selectProfile);
  const [startLocationId, setStartLocationId] = useState("gate");
  const [simulateDrift, setSimulateDrift] = useState(true);
  const [demoCaption, setDemoCaption] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const demoTimers = useRef<number[]>([]);
  const sessionId = useRef<string | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [cameraCommand, setCameraCommand] = useState<NavigatorContextValue["cameraCommand"]>(null);
  const [error, setError] = useState<string | null>(null);
  const cmdCount = useRef(0);
  const watchId = useRef<number | null>(null);

  const sendCamera = useCallback(
    (type: "focus" | "top" | "iso" | "gps" | "fly" | "zoom", payload?: unknown) => {
      cmdCount.current += 1;
      setCameraCommand({ type, payload, n: cmdCount.current });
    },
    [],
  );

  /* ------------------------------------------------------------ favorites */
  const toggleFavorite = useCallback((id: string) => campusStore.toggleFavorite(id), []);
  const updateProfile = useCallback(
    (patch: Partial<UserProfileDoc>) => campusStore.updateProfile(patch),
    [],
  );
  const formatLength = useCallback(
    (metres: number) => formatDistance(metres, profile.units),
    [profile.units],
  );

  /* ---------------------------------------------------------- preferences */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("light", profile.theme === "light");
    root.classList.toggle("reduce-motion", profile.reducedMotion);
    root.style.colorScheme = profile.theme === "light" ? "light" : "dark";
  }, [profile.theme, profile.reducedMotion]);

  /** apply the saved default route preference once on mount */
  const appliedDefaultMode = useRef(false);
  useEffect(() => {
    if (appliedDefaultMode.current) return;
    appliedDefaultMode.current = true;
    setModeState(profile.accessibilityPreference ? "accessible" : profile.defaultRouteMode);
  }, [profile.accessibilityPreference, profile.defaultRouteMode]);

  /* ------------------------------------------------------------- crowd sim */
  useEffect(() => {
    const t = setInterval(() => campusStore.tickCrowd(), 4000);
    return () => clearInterval(t);
  }, []);

  const crowdFor = useCallback(
    (buildingId: string) => {
      const c = crowd.find((x: { id: string }) => x.id === buildingId);
      return { level: (c?.level ?? "low") as CrowdLevel, occupancy: c?.occupancy ?? 25 };
    },
    [crowd],
  );

  /* ------------------------------------------------------------------- GPS */
  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsLive(false);
      setNavState("GPS_UNAVAILABLE");
      setGpsMessage("GPS unavailable. Switching to Campus Demo Position.");
      return;
    }
    setNavState((s) => (s === "IDLE" ? "LOCATING" : s));
    setGpsMessage("Acquiring satellites…");
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { x, z } = geoToLocal(pos.coords.latitude, pos.coords.longitude);
        const inside = Math.abs(x) < 240 && Math.abs(z) < 240;
        setGpsLive(true);
        setDemoMode(false);
        if (inside) {
          setUser((u) => ({
            ...u,
            x,
            z,
            accuracy: Math.round(pos.coords.accuracy * 10) / 10,
            heading: pos.coords.heading ?? u.heading,
          }));
          setGpsMessage("Live GPS lock");
          setIndoorMode(false);
        } else {
          setGpsMessage("Outside campus bounds — anchored to Main Gate");
        }
        setNavState((s) => (s === "LOCATING" ? "IDLE" : s));
      },
      () => {
        setGpsLive(false);
        setNavState("GPS_UNAVAILABLE");
        setGpsMessage("GPS denied. Switching to Campus Demo Position.");
        setDemoMode(true);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    );
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current !== null && typeof navigator !== "undefined")
        navigator.geolocation?.clearWatch(watchId.current);
    };
  }, []);

  /* ----------------------------------------------------------- route build */
  const computeRoutes = useCallback(
    (dest: Destination | null, m: RouteMode) => {
      if (!dest) {
        setRoute(null);
        setAlternatives([]);
        return;
      }
      setNavState("ROUTE_CALCULATING");
      const from = nearestNode(user.x, user.z, 0)?.id ?? START_NODE;
      const main = buildRoute(from, dest.nodeId, m);
      const alts = (["fastest", "accessible", "low_crowd"] as RouteMode[])
        .map((rm) => buildRoute(from, dest.nodeId, rm))
        .filter((r): r is RouteResult => Boolean(r));
      setAlternatives(alts);
      if (!main) {
        setRoute(null);
        setError(
          m === "accessible"
            ? "No step-free route available to this destination."
            : "No route available — construction may be blocking every path.",
        );
        setNavState("DESTINATION_SELECTED");
        return;
      }
      setError(null);
      setRoute(main);
      setProgress(0);
      setCurrentStep(0);
      setNavState("ROUTE_READY");
    },
    [user.x, user.z],
  );

  const selectDestination = useCallback(
    (d: Destination | null) => {
      setDestination(d);
      setSelectedBuilding(d?.buildingId ?? null);
      if (!d) {
        setRoute(null);
        setNavState("IDLE");
        return;
      }
      campusStore.pushRecent(d.id);
      setNavState("DESTINATION_SELECTED");
      computeRoutes(d, mode);
      sendCamera("focus", { x: d.buildingId, floor: d.floor });
    },
    [computeRoutes, mode, sendCamera],
  );

  const selectBuilding = useCallback(
    (buildingId: string) => {
      const d = destinationForBuilding(buildingId);
      if (d) selectDestination(d);
    },
    [selectDestination],
  );

  const setMode = useCallback(
    (m: RouteMode) => {
      setModeState(m);
      computeRoutes(destination, m);
    },
    [computeRoutes, destination],
  );

  /* --------------------------------------------------------- navigation sim */
  useEffect(() => {
    if (navState !== "NAVIGATING" || !route) return;
    let raf = 0;
    let last = performance.now();
    const total = Math.max(route.distance, 1);
    const speed = Math.max(9, total / 26); // metres per second (demo pace)
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((p) => {
        const next = Math.min(1, p + (speed * dt) / total);
        if (next >= 1) setNavState("ARRIVED");
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navState, route]);

  // derive user marker position + active step from progress
  useEffect(() => {
    if (!route || (navState !== "NAVIGATING" && navState !== "ARRIVED")) return;
    const pts = route.nodes;
    const segLens: number[] = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d =
        Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.z - pts[i - 1]!.z) +
        Math.abs(pts[i]!.floor - pts[i - 1]!.floor) * 12;
      segLens.push(d);
      total += d;
    }
    let target = progress * total;
    let idx = 0;
    while (idx < segLens.length && target > segLens[idx]!) {
      target -= segLens[idx]!;
      idx++;
    }
    const a = pts[Math.min(idx, pts.length - 1)]!;
    const b = pts[Math.min(idx + 1, pts.length - 1)]!;
    const t = segLens[idx] ? target / segLens[idx]! : 0;
    setUser((u) => ({
      ...u,
      x: a.x + (b.x - a.x) * t,
      z: a.z + (b.z - a.z) * t,
      floor: t > 0.5 ? b.floor : a.floor,
      heading: (Math.atan2(b.x - a.x, b.z - a.z) * 180) / Math.PI,
    }));
    if (a.floor !== 0) setIndoorMode(true);
    setActiveFloor(t > 0.5 ? b.floor : a.floor);
    // active step = last step whose node index <= idx
    const stepIdx = route.steps.reduce((acc, s, i) => {
      const ni = pts.findIndex((n) => n.id === s.nodeId);
      return ni <= idx + 1 ? i : acc;
    }, 0);
    setCurrentStep(stepIdx);
  }, [progress, route, navState]);

  const startNavigation = useCallback(() => {
    if (!route || !destination) return;
    setProgress(0);
    setCurrentStep(0);
    setNavState("NAVIGATING");
    sendCamera("fly");
    const id = `ns_${Date.now()}`;
    sessionId.current = id;
    campusStore.startSession({
      id,
      userId: profile.id,
      destinationId: destination.id,
      destinationName: destination.name,
      mode,
      distance: route.distance,
      minutes: route.minutes,
      startedAt: Date.now(),
    });
  }, [destination, mode, profile.id, route, sendCamera]);

  useEffect(() => {
    if (navState === "ARRIVED" && sessionId.current) {
      campusStore.completeSession(sessionId.current);
      sessionId.current = null;
    }
  }, [navState]);

  /** move the simulated user to a predefined start building entrance */
  const setStartLocation = useCallback(
    (buildingId: string) => {
      const n = nodeIndex.get(`e_${buildingId}`);
      if (!n) return;
      setStartLocationId(buildingId);
      setDemoMode(true);
      setNavState((s) => (s === "NAVIGATING" ? "ROUTE_READY" : s));
      setProgress(0);
      setIndoorMode(false);
      setActiveFloor(0);
      setUser((u) => ({ ...u, x: n.x, z: n.z, floor: 0, accuracy: 4.2 }));
      setGpsMessage(`Demo position — ${n.label ?? buildingId}`);
      sendCamera("gps");
    },
    [sendCamera],
  );

  const stopNavigation = useCallback(() => {
    setNavState(route ? "ROUTE_READY" : "IDLE");
    setProgress(0);
    setIndoorMode(false);
    setActiveFloor(0);
    const s = nodeIndex.get(`e_${startLocationId}`) ?? nodeIndex.get(START_NODE)!;
    setUser((u) => ({ ...u, x: s.x, z: s.z, floor: 0 }));
  }, [route, startLocationId]);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((d) => {
      const next = !d;
      setGpsMessage(next ? "Demo campus position active" : "Demo mode off — using device GPS");
      if (!next) requestGps();
      return next;
    });
  }, [requestGps]);

  /* ------------------------------------------------- simulated GPS drift */
  useEffect(() => {
    if (!demoMode || !simulateDrift || navState === "NAVIGATING") return;
    const t = setInterval(() => {
      setUser((u) => ({
        ...u,
        x: u.x + (Math.random() - 0.5) * 1.6,
        z: u.z + (Math.random() - 0.5) * 1.6,
        accuracy: Math.round((3.5 + Math.random() * 3) * 10) / 10,
      }));
    }, 2200);
    return () => clearInterval(t);
  }, [demoMode, simulateDrift, navState]);

  /* --------------------------------- keep route in sync with construction */
  const zonesKey = zones.map((z) => `${z.id}:${z.status}`).join("|");
  const skipFirstZoneSync = useRef(true);
  useEffect(() => {
    if (skipFirstZoneSync.current) {
      skipFirstZoneSync.current = false;
      return;
    }
    if (destination && navState !== "NAVIGATING") computeRoutes(destination, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonesKey]);

  /* --------------------------------------------- guided hackathon demo */
  const clearDemo = useCallback(() => {
    demoTimers.current.forEach((t) => clearTimeout(t));
    demoTimers.current = [];
  }, []);

  useEffect(() => clearDemo, [clearDemo]);

  const runDemoScenario = useCallback(() => {
    clearDemo();
    const s = nodeIndex.get(`e_${startLocationId}`) ?? nodeIndex.get(START_NODE)!;
    const dest = destinationById("ce-b204") ?? null;
    const beats: DemoBeat[] = [
      {
        at: 0,
        caption: `Locating you at ${s.label ?? "the Main Gate"}…`,
        run: () => {
          setDemoMode(true);
          setShowCrowd(false);
          setModeState("fastest");
          setDestination(null);
          setRoute(null);
          setIndoorMode(false);
          setActiveFloor(0);
          setProgress(0);
          setNavState("LOCATING");
          setUser((u) => ({ ...u, x: s.x, z: s.z, floor: 0, accuracy: 8.4 }));
          sendCamera("gps");
        },
      },
      {
        at: 1800,
        caption: "Position locked — accuracy 4.2 m. You are here.",
        run: () => {
          setNavState("IDLE");
          setUser((u) => ({ ...u, accuracy: 4.2 }));
        },
      },
      {
        at: 4000,
        caption: "Searching campus for “Lecture Hall B204”…",
        run: () => {
          setSelectedBuilding("ce");
          sendCamera("focus", { x: "ce" });
        },
      },
      {
        at: 6200,
        caption: "Calculating the fastest route around the active construction zone…",
        run: () => {
          setDestination(dest);
          computeRoutes(dest, "fastest");
        },
      },
      {
        at: 9000,
        caption: "Route ready — glowing 3D path drawn from your position to B204.",
      },
      {
        at: 11500,
        caption: "Navigating through the Computer Engineering Block…",
        run: () => {
          setProgress(0);
          setCurrentStep(0);
          setNavState("NAVIGATING");
          sendCamera("fly");
        },
      },
      { at: 18000, caption: "Taking the elevator — switching Ground Floor to Floor 2." },
      {
        at: 26000,
        caption: "Live crowd density overlay enabled across the campus.",
        run: () => setShowCrowd(true),
      },
      {
        at: 33000,
        caption: "Arrived at B204 — step-free alternative is also available.",
      },
    ];
    beats.forEach((beat, i) => {
      const timer = window.setTimeout(() => {
        beat.run?.();
        setDemoCaption(beat.caption);
        setDemoStep(i + 1);
      }, beat.at);
      demoTimers.current.push(timer);
    });
    demoTimers.current.push(
      window.setTimeout(() => setDemoCaption(null), beats[beats.length - 1]!.at + 8000),
    );
    return beats.length;
  }, [clearDemo, computeRoutes, sendCamera, startLocationId]);

  const value = useMemo<NavigatorContextValue>(
    () => ({
      navState,
      user,
      gpsMessage,
      gpsLive,
      demoMode,
      indoorMode,
      toggleDemoMode,
      requestGps,
      destination,
      selectDestination,
      selectBuilding,
      hoveredBuilding,
      setHoveredBuilding,
      selectedBuilding,
      setSelectedBuilding,
      mode,
      setMode,
      route,
      alternatives,
      startNavigation,
      stopNavigation,
      progress,
      currentStep,
      activeFloor,
      setActiveFloor,
      showCrowd,
      setShowCrowd,
      favorites,
      toggleFavorite,
      recents,
      crowdFor,
      zones,
      profile,
      updateProfile,
      formatLength,
      startLocations: START_LOCATIONS,
      startLocationId,
      setStartLocation,
      demoCaption,
      demoStep,
      demoTotal: DEMO_BEATS,
      simulateDrift,
      setSimulateDrift,
      cameraCommand,
      sendCamera,
      runDemoScenario,
      error,
    }),
    [
      navState,
      user,
      gpsMessage,
      gpsLive,
      demoMode,
      indoorMode,
      toggleDemoMode,
      requestGps,
      destination,
      selectDestination,
      selectBuilding,
      hoveredBuilding,
      selectedBuilding,
      mode,
      setMode,
      route,
      alternatives,
      startNavigation,
      stopNavigation,
      progress,
      currentStep,
      activeFloor,
      showCrowd,
      favorites,
      toggleFavorite,
      recents,
      crowdFor,
      zones,
      profile,
      updateProfile,
      formatLength,
      startLocationId,
      setStartLocation,
      demoCaption,
      demoStep,
      simulateDrift,
      cameraCommand,
      sendCamera,
      runDemoScenario,
      error,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNavigator() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNavigator must be used inside NavigatorProvider");
  return ctx;
}

export const userGeo = (u: UserPosition) => localToGeo(u.x, u.z);

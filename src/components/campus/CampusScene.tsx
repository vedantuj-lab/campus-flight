import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { buildings, landmarks, nodeIndex, rooms } from "@/lib/campus/data";
import { useNavigator } from "@/lib/state";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Building } from "@/types/campus";

type OrbitControlsRef = OrbitControlsImpl | null;

const FLOOR_HEIGHT = 9;

/* --------------------------------------------------------------- ground */

function Ground() {
  const roads = useMemo(() => {
    const items: { x: number; z: number; w: number; d: number }[] = [];
    for (let i = -160; i <= 160; i += 80) {
      items.push({ x: i, z: 0, w: 9, d: 360 });
      items.push({ x: 0, z: i, w: 360, d: 9 });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[520, 520]} />
        <meshStandardMaterial color="#0b1220" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#101a2e" roughness={0.9} />
      </mesh>
      {roads.map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.06, r.z]} receiveShadow>
          <planeGeometry args={[r.w, r.d]} />
          <meshStandardMaterial
            color="#16243d"
            roughness={0.8}
            emissive="#0e7490"
            emissiveIntensity={0.06}
          />
        </mesh>
      ))}
      {/* lawn / garden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.07, 40]} receiveShadow>
        <circleGeometry args={[46, 48]} />
        <meshStandardMaterial
          color="#12341f"
          roughness={1}
          emissive="#0f5132"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* sports field turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[108, 0.07, -132]} receiveShadow>
        <planeGeometry args={[104, 70]} />
        <meshStandardMaterial
          color="#14402a"
          roughness={1}
          emissive="#0f5132"
          emissiveIntensity={0.1}
        />
      </mesh>
      <ParkingStalls />
      <gridHelper args={[400, 40, "#1e3a5f", "#152238"]} position={[0, 0.08, 0]} />
    </group>
  );
}

/** painted bays on the north parking deck apron */
function ParkingStalls() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const stalls = useMemo(() => {
    const out: [number, number][] = [];
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 12; i++) out.push([-164 + i * 6, 158 + row * 14]);
    return out;
  }, []);
  useEffect(() => {
    const m = new THREE.Object3D();
    stalls.forEach(([x, z], i) => {
      m.position.set(x, 0.09, z);
      m.rotation.set(-Math.PI / 2, 0, 0);
      m.updateMatrix();
      ref.current?.setMatrixAt(i, m.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [stalls]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, stalls.length]}>
      <planeGeometry args={[0.6, 10]} />
      <meshBasicMaterial color="#38507a" transparent opacity={0.65} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------- buildings */

function BuildingMesh({ b }: { b: Building }) {
  const {
    hoveredBuilding,
    setHoveredBuilding,
    selectedBuilding,
    selectBuilding,
    activeFloor,
    showCrowd,
    crowdFor,
    sendCamera,
  } = useNavigator();
  const ref = useRef<THREE.Mesh>(null);
  const hovered = hoveredBuilding === b.id;
  const selected = selectedBuilding === b.id;
  const crowd = crowdFor(b.id);
  const targetY = useRef(0);
  const [appeared, setAppeared] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAppeared(true), 120 + Math.random() * 700);
    return () => clearTimeout(t);
  }, []);

  const crowdColor =
    crowd.level === "high" ? "#f87171" : crowd.level === "moderate" ? "#fbbf24" : "#4ade80";
  const color = showCrowd ? crowdColor : b.accent;
  const dimmed = activeFloor > 0 && b.floors <= activeFloor;

  useFrame((_, delta) => {
    if (!ref.current) return;
    targetY.current = appeared ? b.height / 2 : -b.height;
    ref.current.position.y += (targetY.current - ref.current.position.y) * Math.min(1, delta * 4);
    const s = hovered || selected ? 1.03 : 1;
    ref.current.scale.x += (s - ref.current.scale.x) * Math.min(1, delta * 8);
    ref.current.scale.z += (s - ref.current.scale.z) * Math.min(1, delta * 8);
  });

  return (
    <group position={[b.x, 0, b.z]}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        position={[0, -b.height, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBuilding(b.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHoveredBuilding(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectBuilding(b.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          sendCamera("focus", { x: b.id });
        }}
      >
        <boxGeometry args={[b.width, b.height, b.depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.5}
          transparent
          opacity={dimmed ? 0.28 : selected ? 0.98 : 0.88}
          emissive={color}
          emissiveIntensity={selected ? 0.55 : hovered ? 0.4 : 0.12}
        />
      </mesh>
      {/* lit floor bands read as windows from a distance */}
      {appeared &&
        Array.from({ length: b.floors }, (_, f) => (
          <mesh key={f} position={[0, (f + 0.62) * (b.height / b.floors), 0]}>
            <boxGeometry args={[b.width + 0.4, 0.9, b.depth + 0.4]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={dimmed ? 0.12 : activeFloor === f ? 0.95 : 0.35}
              toneMapped={false}
            />
          </mesh>
        ))}
      {/* neon roof edge */}
      <mesh position={[0, b.height + 0.4, 0]}>
        <boxGeometry args={[b.width + 1.2, 0.5, b.depth + 1.2]} />
        <meshBasicMaterial color={color} transparent opacity={hovered || selected ? 0.95 : 0.45} />
      </mesh>
      {(hovered || selected) && (
        <Html center distanceFactor={190} position={[0, b.height + 16, 0]} zIndexRange={[10, 0]}>
          <div className="pointer-events-none min-w-40 rounded-xl border border-primary/40 bg-background/85 px-3 py-2 text-center shadow-[0_0_30px_-8px_var(--glow)] backdrop-blur">
            <p className="text-[11px] font-semibold tracking-wide text-foreground">{b.name}</p>
            <p className="text-[9px] uppercase tracking-widest text-primary">
              {b.type} · {b.floors} {b.floors > 1 ? "floors" : "floor"}
            </p>
          </div>
        </Html>
      )}
      {showCrowd && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <circleGeometry args={[Math.max(b.width, b.depth) * 0.8, 40]} />
          <meshBasicMaterial color={crowdColor} transparent opacity={0.16} />
        </mesh>
      )}
    </group>
  );
}

/* -------------------------------------------------------------- rooms 3D */

function FloorRooms() {
  const { activeFloor, selectedBuilding, destination, selectDestination } = useNavigator();
  const items = useMemo(
    () =>
      rooms
        .filter((r) => r.floor === activeFloor)
        .map((r) => {
          const n = nodeIndex.get(`r_${r.id}`);
          return n ? { r, n } : null;
        })
        .filter(Boolean) as {
        r: (typeof rooms)[number];
        n: NonNullable<ReturnType<typeof nodeIndex.get>>;
      }[],
    [activeFloor],
  );
  if (activeFloor === 0) return null;
  return (
    <group>
      {items.map(({ r, n }) => {
        const active = destination?.id === r.id;
        const focus = selectedBuilding === r.building;
        return (
          <group key={r.id} position={[n.x, activeFloor * FLOOR_HEIGHT + 1, n.z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectDestination({
                  id: r.id,
                  nodeId: `r_${r.id}`,
                  name: r.name,
                  subtitle: r.type,
                  buildingId: r.building,
                  buildingName: r.building,
                  floor: r.floor,
                  category: r.category,
                  type: r.type,
                  accessible: r.accessible,
                  hours: "",
                  keywords: "",
                });
              }}
            >
              <boxGeometry args={[9, 3, 7]} />
              <meshStandardMaterial
                color={active ? "#22d3ee" : focus ? "#818cf8" : "#334155"}
                emissive={active ? "#22d3ee" : "#1e293b"}
                emissiveIntensity={active ? 0.8 : 0.2}
                transparent
                opacity={0.9}
              />
            </mesh>
            {(active || focus) && (
              <Html center distanceFactor={150} position={[0, 6, 0]}>
                <span className="pointer-events-none rounded-md bg-background/80 px-2 py-0.5 text-[9px] font-medium text-foreground backdrop-blur">
                  {r.name}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------------------------------------- landmarks */

function Landmarks() {
  const trees = landmarks.filter((l) => l.kind === "tree");
  const lights = landmarks.filter((l) => l.kind === "light");
  const benches = landmarks.filter((l) => l.kind === "bench");
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);
  const benchRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const m = new THREE.Object3D();
    trees.forEach((t, i) => {
      m.position.set(t.x, 2.5, t.z);
      m.scale.setScalar(1);
      m.updateMatrix();
      trunkRef.current?.setMatrixAt(i, m.matrix);
      m.position.set(t.x, 7.2, t.z);
      m.updateMatrix();
      leafRef.current?.setMatrixAt(i, m.matrix);
    });
    lights.forEach((l, i) => {
      m.position.set(l.x, 4.5, l.z);
      m.updateMatrix();
      poleRef.current?.setMatrixAt(i, m.matrix);
      m.position.set(l.x, 9.2, l.z);
      m.updateMatrix();
      lampRef.current?.setMatrixAt(i, m.matrix);
    });
    benches.forEach((b, i) => {
      m.position.set(b.x, 1, b.z);
      m.updateMatrix();
      benchRef.current?.setMatrixAt(i, m.matrix);
    });
    [trunkRef, leafRef, poleRef, lampRef, benchRef].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [trees, lights, benches]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 5, 6]} />
        <meshStandardMaterial color="#3f3222" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, trees.length]} castShadow>
        <icosahedronGeometry args={[4, 0]} />
        <meshStandardMaterial color="#1f7a52" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={poleRef} args={[undefined, undefined, lights.length]}>
        <cylinderGeometry args={[0.24, 0.24, 9, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={lampRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshBasicMaterial color="#a5f3fc" />
      </instancedMesh>
      <instancedMesh ref={benchRef} args={[undefined, undefined, benches.length]}>
        <boxGeometry args={[4, 0.5, 1.4]} />
        <meshStandardMaterial color="#475569" />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------- construction */

function ConstructionZones() {
  const { zones } = useNavigator();
  const active = zones.filter((c) => c.status !== "cleared");
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const p = 0.18 + Math.sin(clock.elapsedTime * 2) * 0.07;
    ref.current.children.forEach((c) => {
      const mesh = c.children[0] as THREE.Mesh;
      const mat = mesh?.material as THREE.MeshBasicMaterial | undefined;
      if (mat) mat.opacity = p;
    });
  });
  return (
    <group ref={ref}>
      {active.map((c) => (
        <group key={c.id} position={[c.x, 0.3, c.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[c.radius, 36]} />
            <meshBasicMaterial
              color={c.status === "active" ? "#f59e0b" : "#a3a3a3"}
              transparent
              opacity={0.2}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[c.radius - 1.2, c.radius, 48]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
          </mesh>
          <Html center distanceFactor={220} position={[0, 8, 0]}>
            <span className="pointer-events-none whitespace-nowrap rounded-md border border-warning/40 bg-background/80 px-2 py-0.5 text-[9px] font-semibold text-warning backdrop-blur">
              🚧 {c.name}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

/* --------------------------------------------------------- user marker */

function UserMarker() {
  const { user, gpsLive } = useNavigator();
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    const t = (clock.elapsedTime % 2) / 2;
    if (ring.current) {
      const s = 1 + t * 3.4;
      ring.current.scale.set(s, s, s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    }
    if (core.current) core.current.position.y = 3 + Math.sin(clock.elapsedTime * 2.4) * 0.4;
    if (group.current) {
      const y = user.floor * FLOOR_HEIGHT;
      group.current.position.x += (user.x - group.current.position.x) * Math.min(1, delta * 6);
      group.current.position.z += (user.z - group.current.position.z) * Math.min(1, delta * 6);
      group.current.position.y += (y - group.current.position.y) * Math.min(1, delta * 4);
    }
  });
  return (
    <group ref={group} position={[user.x, 0, user.z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <ringGeometry args={[2.4, 3.4, 40]} />
        <meshBasicMaterial color={gpsLive ? "#4ade80" : "#22d3ee"} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 32]} />
        <meshBasicMaterial color={gpsLive ? "#4ade80" : "#22d3ee"} transparent opacity={0.25} />
      </mesh>
      <mesh ref={core} position={[0, 3, 0]}>
        <sphereGeometry args={[1.5, 20, 20]} />
        <meshStandardMaterial
          color={gpsLive ? "#4ade80" : "#22d3ee"}
          emissive={gpsLive ? "#4ade80" : "#22d3ee"}
          emissiveIntensity={1.6}
        />
      </mesh>
      <pointLight color="#22d3ee" intensity={30} distance={45} position={[0, 6, 0]} />
      <Html center distanceFactor={170} position={[0, 9, 0]}>
        <span className="pointer-events-none whitespace-nowrap rounded-full border border-primary/50 bg-background/85 px-2.5 py-1 text-[10px] font-semibold text-primary backdrop-blur">
          You are here
        </span>
      </Html>
    </group>
  );
}

/* ----------------------------------------------------------- route path */

function RoutePath() {
  const { route, progress, navState } = useNavigator();
  const tubeRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const drawRef = useRef(0);

  const curve = useMemo(() => {
    if (!route || route.nodes.length < 2) return null;
    const pts = route.nodes.map((n) => new THREE.Vector3(n.x, n.floor * FLOOR_HEIGHT + 1.6, n.z));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.25);
  }, [route]);

  const geometry = useMemo(
    () => (curve ? new THREE.TubeGeometry(curve, 220, 1.1, 10, false) : null),
    [curve],
  );

  useEffect(() => {
    drawRef.current = 0;
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    if (!geometry || !curve) return;
    drawRef.current = Math.min(1, drawRef.current + delta * 0.75);
    const count = geometry.index ? geometry.index.count : 0;
    geometry.setDrawRange(0, Math.floor(count * drawRef.current));
    if (markerRef.current) {
      const t = navState === "NAVIGATING" || navState === "ARRIVED" ? progress : drawRef.current;
      const p = curve.getPointAt(Math.min(0.999, Math.max(0.001, t)));
      markerRef.current.position.copy(p);
      markerRef.current.position.y += 1.2;
    }
    if (tubeRef.current) {
      const mat = tubeRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(performance.now() / 260) * 0.35;
    }
  });

  if (!geometry) return null;
  const accessible = route?.mode === "accessible";
  const color = accessible ? "#4ade80" : "#22d3ee";

  return (
    <group>
      <mesh ref={tubeRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          transparent
          opacity={0.92}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={markerRef}>
        <sphereGeometry args={[2.1, 18, 18]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {route?.nodes.map((n, i) =>
        n.kind === "elevator" || n.kind === "stairs" ? (
          <mesh key={`${n.id}-${i}`} position={[n.x, n.floor * FLOOR_HEIGHT + 4, n.z]}>
            <octahedronGeometry args={[2.4, 0]} />
            <meshBasicMaterial color={n.kind === "elevator" ? "#4ade80" : "#fbbf24"} />
          </mesh>
        ) : null,
      )}
    </group>
  );
}

/* ------------------------------------------------------ camera director */

function CameraDirector({ controls }: { controls: React.RefObject<OrbitControlsRef> }) {
  const { cameraCommand, user, navState } = useNavigator();
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const camTarget = useRef(new THREE.Vector3(120, 150, 220));
  const follow = useRef(false);

  useEffect(() => {
    if (!cameraCommand) return;
    const c = cameraCommand;
    if (c.type === "focus") {
      const id = (c.payload as { x: string } | undefined)?.x;
      const b = buildings.find((x) => x.id === id);
      if (b) {
        follow.current = false;
        target.current.set(b.x, b.height / 2, b.z);
        camTarget.current.set(b.x + 70, b.height + 75, b.z + 90);
      }
    } else if (c.type === "top") {
      follow.current = false;
      target.current.set(0, 0, 0);
      camTarget.current.set(0.1, 330, 0.1);
    } else if (c.type === "iso") {
      follow.current = false;
      target.current.set(0, 0, 0);
      camTarget.current.set(150, 150, 220);
    } else if (c.type === "gps") {
      follow.current = false;
      target.current.set(user.x, 0, user.z);
      camTarget.current.set(user.x + 45, 60, user.z + 55);
    } else if (c.type === "fly") {
      follow.current = true;
    } else if (c.type === "zoom") {
      const dir = (c.payload as number) ?? 1;
      const v = camera.position
        .clone()
        .sub(target.current)
        .multiplyScalar(dir > 0 ? 0.75 : 1.3);
      camTarget.current.copy(target.current.clone().add(v));
    }
  }, [cameraCommand, camera, user.x, user.z]);

  useEffect(() => {
    if (navState !== "NAVIGATING") follow.current = false;
  }, [navState]);

  useFrame((_, delta) => {
    if (follow.current) {
      target.current.set(user.x, 4, user.z);
      camTarget.current.set(user.x + 42, 52, user.z + 60);
    }
    const k = Math.min(1, delta * 2.2);
    camera.position.lerp(camTarget.current, k);
    if (controls.current) {
      controls.current.target.lerp(target.current, k);
      controls.current.update();
    }
  });
  return null;
}

/* ------------------------------------------------------------- wrapper */

export default function CampusScene() {
  const controls = useRef<OrbitControlsRef>(null);
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [150, 150, 220], fov: 48, far: 3000 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#070b16"]} />
      <fog attach="fog" args={["#070b16", 320, 780]} />
      <hemisphereLight intensity={0.5} color="#7dd3fc" groundColor="#0b1220" />
      <directionalLight
        position={[120, 200, 140]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-140, 90, -120]} intensity={140} color="#a78bfa" distance={420} />
      <pointLight position={[160, 80, 120]} intensity={120} color="#22d3ee" distance={420} />
      <Environment preset="night" />
      <Ground />
      {buildings.map((b) => (
        <BuildingMesh key={b.id} b={b} />
      ))}
      <FloorRooms />
      <Landmarks />
      <ConstructionZones />
      <RoutePath />
      <UserMarker />
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={40}
        maxDistance={620}
      />
      <CameraDirector controls={controls} />
    </Canvas>
  );
}

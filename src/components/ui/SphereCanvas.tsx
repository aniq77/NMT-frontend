"use client";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

const R = 2;
// Clip plane: keep x ≥ 0 (clips away x < 0 side)
// THREE.Plane clips fragments where normal·point + constant < 0
// normal=(1,0,0), constant=0  →  clips where x < 0  →  keeps x ≥ 0
const CLIP = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

// ── Label badge rendered as DOM inside the scene ──────────────────────────────
function Badge({
  children,
  bg = "#6366f1",
  color = "#fff",
}: {
  children: React.ReactNode;
  bg?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: bg,
        color,
        padding: "2px 8px",
        borderRadius: 5,
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "system-ui, sans-serif",
        border: "1.5px solid rgba(255,255,255,0.35)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}

// ── Equatorial arc (x ≥ 0 side, lies in the xz-plane) ────────────────────────
function EquatorArc() {
  const points = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: 33 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 32) * Math.PI; // –π/2 → +π/2 (x ≥ 0 arc)
        return [R * Math.cos(a), 0, R * Math.sin(a)];
      }),
    [],
  );
  return <Line points={points} color="#94a3b8" lineWidth={1} />;
}

// ── Main 3-D scene ────────────────────────────────────────────────────────────
function SphereScene() {
  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 6]} intensity={1.2} />
      <pointLight position={[-4, 2, -4]} intensity={0.5} color="#a78bfa" />

      {/* ── Half-sphere (clipped to x ≥ 0) ── */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          clippingPlanes={[CLIP]}
          side={THREE.DoubleSide}
          roughness={0.18}
          metalness={0.05}
        />
      </mesh>

      {/* ── Cross-section disk (yz-plane) ── */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[R, 64]} />
        <meshStandardMaterial
          color="#a5b4fc"
          side={THREE.DoubleSide}
          roughness={0.4}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ── Equatorial arc ── */}
      <EquatorArc />

      {/* ── Radius line: O → north-pole of cross-section ── */}
      <Line points={[[0, 0, 0], [0, R, 0]]} color="#ffffff" lineWidth={2.5} />

      {/* ── Diameter line: south → north across cross-section ── */}
      <Line
        points={[[0, -R, 0], [0, R, 0]]}
        color="#fbbf24"
        lineWidth={2}
        dashed
        dashSize={0.14}
        gapSize={0.08}
      />

      {/* ── Short surface-radius line: O → equator edge of sphere ── */}
      <Line points={[[0, 0, 0], [R, 0, 0]]} color="#ffffff" lineWidth={1.5} />

      {/* ── Endpoint dots ── */}
      {([
        [0, 0, 0],  // center O
        [0, R, 0],  // north pole
        [0, -R, 0], // south pole
        [R, 0, 0],  // equator edge
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}

      {/* ── HTML labels ── */}
      {/* O — center */}
      <Html position={[0.18, -0.22, 0]} center>
        <Badge bg="#1e1b4b">O</Badge>
      </Html>

      {/* R — mid-point of vertical radius */}
      <Html position={[0.32, R / 2, 0]} center>
        <Badge bg="#4f46e5">R</Badge>
      </Html>

      {/* R — surface radius along x-axis */}
      <Html position={[R / 2, 0.28, 0]} center>
        <Badge bg="#4f46e5">R</Badge>
      </Html>

      {/* D = 2R — diameter, placed beside the bottom endpoint */}
      <Html position={[0.55, -R - 0.28, 0]} center>
        <Badge bg="#b45309">D = 2R</Badge>
      </Html>

      {/* Label on cross-section disk */}
      <Html position={[0, 0, R * 0.55]} center>
        <Badge bg="rgba(99,102,241,0.7)" color="#e0e7ff">
          Переріз
        </Badge>
      </Html>

      {/* ── Orbit controls ── */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.4}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={(Math.PI * 7) / 8}
      />
    </>
  );
}

// ── Exported canvas (must be imported with dynamic + ssr:false) ───────────────
export function SphereCanvas() {
  return (
    <Canvas
      gl={{ localClippingEnabled: true }}
      camera={{ position: [4, 2.5, 4.5], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1e1b4b"]} />
      <fog attach="fog" args={["#1e1b4b", 10, 22]} />
      <SphereScene />
    </Canvas>
  );
}

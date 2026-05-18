"use client";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

const R = 1.5;   // base radius
const H = 3.2;   // height
const L = Math.sqrt(R * R + H * H); // slant height ≈ 3.53

// Keep x ≥ 0 half (same convention as SphereCanvas)
const CLIP = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

// ── Shared badge component ────────────────────────────────────────────────────
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

// ── Cross-section face: isosceles triangle in the yz-plane ───────────────────
function CrossSectionFace() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Vertices: apex, base-right (+z), base-left (–z)
    const verts = new Float32Array([
      0,  H / 2,  0,   // apex
      0, -H / 2,  R,   // base edge, +z
      0, -H / 2, -R,   // base edge, –z
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#a5b4fc"
        side={THREE.DoubleSide}
        roughness={0.4}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ── Main scene ───────────────────────────────────────────────────────────────
function ConeScene() {
  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 6]} intensity={1.2} />
      <pointLight position={[-4, 2, -4]} intensity={0.5} color="#a78bfa" />

      {/* ── Cone body (x ≥ 0 half) ── */}
      <mesh>
        <coneGeometry args={[R, H, 64, 1, false]} />
        <meshStandardMaterial
          color="#6366f1"
          clippingPlanes={[CLIP]}
          side={THREE.DoubleSide}
          roughness={0.18}
          metalness={0.05}
        />
      </mesh>

      {/* ── Base disk (x ≥ 0 half) ── */}
      <mesh position={[0, -H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 64]} />
        <meshStandardMaterial
          color="#a5b4fc"
          clippingPlanes={[CLIP]}
          side={THREE.DoubleSide}
          roughness={0.4}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ── Cross-section triangle face ── */}
      <CrossSectionFace />

      {/* ── Measurement lines (all in yz-plane at x=0) ── */}
      {/* H — height, white vertical */}
      <Line points={[[0, -H / 2, 0], [0, H / 2, 0]]} color="#ffffff" lineWidth={2.5} />
      {/* R — base radius, amber horizontal */}
      <Line points={[[0, -H / 2, 0], [0, -H / 2, R]]} color="#fbbf24" lineWidth={2} />
      {/* L — slant height, green diagonal */}
      <Line points={[[0, H / 2, 0], [0, -H / 2, R]]} color="#34d399" lineWidth={2} />

      {/* ── Right-angle marker where H meets R ── */}
      <Line
        points={[
          [0, -H / 2 + 0.2, 0],
          [0, -H / 2 + 0.2, 0.2],
          [0, -H / 2, 0.2],
        ]}
        color="rgba(255,255,255,0.55)"
        lineWidth={1.5}
      />

      {/* ── Endpoint dots ── */}
      {([
        [0,  H / 2, 0] as [number, number, number],  // apex
        [0, -H / 2, 0] as [number, number, number],  // base center
        [0, -H / 2, R] as [number, number, number],  // base edge
      ]).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}

      {/* ── HTML labels ── */}
      {/* Apex */}
      <Html position={[0.35, H / 2 + 0.28, 0]} center>
        <Badge bg="#1e1b4b" color="#e0e7ff">Вершина</Badge>
      </Html>

      {/* H */}
      <Html position={[0.42, 0.1, 0.08]} center>
        <Badge bg="#4f46e5">H — висота</Badge>
      </Html>

      {/* R */}
      <Html position={[0.35, -H / 2 - 0.32, R / 2]} center>
        <Badge bg="#b45309">R — радіус</Badge>
      </Html>

      {/* L */}
      <Html position={[0.42, 0.22, R / 2 + 0.18]} center>
        <Badge bg="#059669">L — твірна</Badge>
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

// ── Exported canvas ───────────────────────────────────────────────────────────
export function ConeCanvas() {
  return (
    <Canvas
      gl={{ localClippingEnabled: true }}
      camera={{ position: [4, 2.5, 4.5], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1e1b4b"]} />
      <fog attach="fog" args={["#1e1b4b", 10, 22]} />
      <ConeScene />
    </Canvas>
  );
}

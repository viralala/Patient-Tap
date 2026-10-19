"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero's 3D NFC wristband — built procedurally (no model download):
 * a lathed silicone band with an iridescent thin-film finish, a raised tag
 * module, and NFC pulse rings radiating from the chip. Reflections come from
 * an in-memory light-former environment, so nothing loads from a CDN.
 *
 * `progress` (0..1, written by the hero's ScrollTrigger) drives the scroll
 * choreography; the pointer adds a gentle tilt.
 */

const BAND_R = 1.28; // inner radius
const BAND_T = 0.15; // wall thickness
const BAND_H = 0.92; // band width
const CORNER = 0.065;

/** Rounded-rectangle cross-section, revolved around Y to make the band. */
function bandProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const x0 = BAND_R;
  const x1 = BAND_R + BAND_T;
  const y0 = -BAND_H / 2;
  const y1 = BAND_H / 2;
  const arc = (cx: number, cy: number, from: number, to: number) => {
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const a = from + ((to - from) * i) / steps;
      pts.push(new THREE.Vector2(cx + Math.cos(a) * CORNER, cy + Math.sin(a) * CORNER));
    }
  };
  // Counter-clockwise: inner-bottom → outer-bottom → outer-top → inner-top.
  arc(x0 + CORNER, y0 + CORNER, Math.PI, Math.PI * 1.5);
  arc(x1 - CORNER, y0 + CORNER, Math.PI * 1.5, Math.PI * 2);
  arc(x1 - CORNER, y1 - CORNER, 0, Math.PI * 0.5);
  arc(x0 + CORNER, y1 - CORNER, Math.PI * 0.5, Math.PI);
  pts.push(pts[0].clone());
  return pts;
}

function PulseRings() {
  const group = useRef<THREE.Group>(null);
  const rings = 3;
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const phase = ((t * 0.55 + i / rings) % 1 + 1) % 1;
      const s = 0.35 + phase * 2.4;
      child.scale.setScalar(s);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - phase) * 0.55;
    });
  });
  return (
    <group ref={group} position={[BAND_R + BAND_T + 0.09, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {Array.from({ length: rings }).map((_, i) => (
        <mesh key={i}>
          <torusGeometry args={[0.32, 0.008, 8, 96]} />
          <meshBasicMaterial
            color="#7f9bff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Wristband({ progress }: { progress: React.RefObject<number> }) {
  const root = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.LatheGeometry(bandProfile(), 160), []);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const t = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    // Idle spin + pointer tilt + scroll choreography, all eased.
    const targetY = t * 0.22 + x * 0.45 + p * Math.PI * 1.1;
    const targetX = -1.02 + y * 0.18 + p * 0.55;
    const k = 1 - Math.pow(0.0015, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    g.rotation.z = Math.sin(t * 0.5) * 0.05;
    g.position.y = Math.sin(t * 0.9) * 0.06 - p * 0.6;
    const s = 0.86 - p * 0.16;
    g.scale.setScalar(s);
  });

  return (
    <group ref={root} rotation={[-1.02, 0, 0]}>
      {/* silicone band, thin-film iridescent finish */}
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color="#14141b"
          roughness={0.28}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.18}
          iridescence={1}
          iridescenceIOR={1.55}
          iridescenceThicknessRange={[180, 820]}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* tag module on the outer face */}
      <group position={[BAND_R + BAND_T + 0.02, 0, 0]}>
        <RoundedBox args={[0.12, 0.6, 0.86]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial
            color="#0b0b10"
            roughness={0.22}
            metalness={0.75}
            clearcoat={1}
            iridescence={0.55}
            iridescenceIOR={1.4}
          />
        </RoundedBox>
        {/* NFC chip glyph */}
        <group position={[0.065, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[0.13, 0.014, 12, 64]} />
            <meshStandardMaterial color="#5e7dee" emissive="#5e7dee" emissiveIntensity={2.2} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.07, 0.012, 12, 48]} />
            <meshStandardMaterial color="#9fb4ff" emissive="#9fb4ff" emissiveIntensity={1.6} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.028, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      <PulseRings />
    </group>
  );
}

export default function WristbandScene({
  progress,
  active,
}: {
  progress: React.RefObject<number>;
  active: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, -1, 2]} intensity={14} color="#9b5cff" />
      <pointLight position={[3, 1, 2]} intensity={10} color="#37e0f0" />

      <Wristband progress={progress} />

      <Sparkles count={70} scale={[7, 4.5, 3]} size={2.2} speed={0.25} opacity={0.6} color="#a8b8ff" />

      {/* Holographic studio, rendered once into an environment map. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#3b6dff" position={[-4, 2, 3]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={3} color="#9b5cff" position={[4, 1, 2]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#ff5cc4" position={[0, -3, 3]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={3} color="#37e0f0" position={[0, 4, -2]} scale={3} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 0, 6]} scale={[6, 1, 1]} />
      </Environment>
    </Canvas>
  );
}

"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 2500;

/*
 * Soft circular glow texture — drawn once on a 32×32 canvas.
 * Radial gradient from white core to fully transparent edge.
 * Used as both map + alphaMap so each particle is a soft disc.
 */
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0,   "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.7)");
  g.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

function Particles() {
  const ref     = useRef();
  const { camera } = useThree();
  const lerp    = useRef({ x: 0, y: 0 });

  // Glow texture — created once, never recreated
  const texture = useMemo(() => makeGlowTexture(), []);

  const { positions, colors, velocities } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3);
    const colors     = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // Spread across wide 3-D volume to fill the entire viewport
      positions[i * 3]     = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = -Math.random() * 18;          // depth: 0 → -18

      /*
       * Brightness: power-skewed toward dim (exponent 1.9).
       * Most particles barely visible — a few are luminous.
       * This mirrors how real dust/stars distribute in nature.
       */
      const b = 0.06 + Math.pow(Math.random(), 1.9) * 0.85;
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = b;

      // Ultra-slow drift: mostly upward, tiny lateral wander
      velocities[i * 3]     = (Math.random() - 0.5) * 0.0018;
      velocities[i * 3 + 1] = 0.0005 + Math.random() * 0.0018;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return { positions, colors, velocities };
  }, []);

  useFrame(({ mouse }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;

    for (let i = 0; i < COUNT; i++) {
      pos.array[i * 3]     += velocities[i * 3];
      pos.array[i * 3 + 1] += velocities[i * 3 + 1];
      pos.array[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap at top → reappear at bottom (seamless loop)
      if (pos.array[i * 3 + 1] > 11) pos.array[i * 3 + 1] = -11;

      // Reflect at x/z walls so particles stay in the volume
      if (Math.abs(pos.array[i * 3])     > 16) velocities[i * 3]     *= -1;
      if (Math.abs(pos.array[i * 3 + 2]) >  9) velocities[i * 3 + 2] *= -1;
    }
    pos.needsUpdate = true;

    // Camera parallax — extremely gentle, fully smoothed
    lerp.current.x += (-mouse.x * 0.45 - lerp.current.x) * 0.028;
    lerp.current.y += ( mouse.y * 0.3  - lerp.current.y) * 0.028;
    camera.position.x = lerp.current.x;
    camera.position.y = lerp.current.y;
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        map={texture}
        alphaMap={texture}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Particles />
    </Canvas>
  );
}

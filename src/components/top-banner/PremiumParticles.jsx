"use client";

import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;

function generateGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(240,240,250,0.8)");
  gradient.addColorStop(0.5, "rgba(200,200,220,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function ParticleWaves() {
  const pointsRef = useRef();
  const { clock } = useThree();

  const glowTexture = useMemo(() => generateGlowTexture(), []);

  // Set up particles in a horizontal plane/wave structure
  const { positions, colorValues, randomOffsets } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const offsets = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Position particles in a grid-like or circular layer spread across X and Z
      // Using polar coordinates or random scattering with a shape
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.sqrt(Math.random()) * 18;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 5; // offset depth
      const y = (Math.random() - 0.5) * 1.5; // slight initial thickness

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color: premium whitish-grayish with subtle cool/warm variance
      const colorNoise = Math.random();
      cols[i * 3] = 0.85 + colorNoise * 0.15;     // R
      cols[i * 3 + 1] = 0.88 + colorNoise * 0.12; // G
      cols[i * 3 + 2] = 0.95;                     // B (slight cool premium blue-gray)

      offsets[i] = Math.random() * 100; // unique phase offset for waves
    }

    return { positions: pos, colorValues: cols, randomOffsets: offsets };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const x = posAttr.array[idx];
      const z = posAttr.array[idx + 2];
      const offset = randomOffsets[i];

      // Wave calculation: Multiple superposed sine waves moving over X & Z (radial waves)
      const distance = Math.sqrt(x * x + z * z);
      
      // Primary wave + secondary micro-wave for organic turbulence
      const wave1 = Math.sin(distance * 0.28 - time * 0.65 + offset * 0.05) * 0.85;
      const wave2 = Math.cos(x * 0.15 + time * 0.45 + offset * 0.1) * 0.45;
      const wave3 = Math.sin(z * 0.22 - time * 0.8 + offset * 0.02) * 0.35;

      posAttr.array[idx + 1] = wave1 + wave2 + wave3;
    }
    posAttr.needsUpdate = true;

    // Slow organic rotation of the entire particle layer
    pointsRef.current.rotation.y = time * 0.025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colorValues}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={glowTexture}
        alphaMap={glowTexture}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function PremiumParticles() {
  return (
    <Canvas
      camera={{ position: [0, 6, 12], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <ParticleWaves />
    </Canvas>
  );
}

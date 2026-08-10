"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 8500;
const SPHERE_RADIUS  = 2.4;
const REPEL_RADIUS   = 2.2;
const ATTRACT_RADIUS = 3.8;
const REPEL_STR      = 0.4;
const ATTRACT_STR    = 0.06;
const DAMP           = 0.88;
const LERP_SPEED     = 0.065;
const ROT_X          = 0.0003;
const ROT_Y          = 0.0008;

function buildSphere(count, R) {
  const base     = new Float32Array(count * 3);
  const displace = new Float32Array(count * 3);
  const smoothed = new Float32Array(count * 3);
  const sparkles = new Float32Array(count); // Random sparkling frequency factor

  for (let i = 0; i < count; i++) {
    // Generate particles in a beautiful hollow shell structure
    const theta = Math.acos(2 * Math.random() - 1);
    const phi   = Math.random() * Math.PI * 2;
    
    // Distribute with slight shell thickness variance for depth
    const variance = 0.88 + Math.random() * 0.18;
    const r = R * variance;

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    base[i * 3] = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;
    smoothed[i * 3] = x;
    smoothed[i * 3 + 1] = y;
    smoothed[i * 3 + 2] = z;

    sparkles[i] = 0.2 + Math.random() * 0.8;
  }
  return { base, displace, smoothed, sparkles };
}

// ── Soft premium radial gradient floor shadow beneath the sphere ──
function SoftShadow({ radius }) {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const cx = size / 2, cy = size / 2;

    const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2.2);
    // Dark luxury floor shadow blending perfectly into the custom background
    outer.addColorStop(0,    "rgba(0, 0, 0, 0.82)");
    outer.addColorStop(0.3,  "rgba(0, 0, 0, 0.65)");
    outer.addColorStop(0.6,  "rgba(0, 0, 0, 0.25)");
    outer.addColorStop(0.85, "rgba(0, 0, 0, 0.05)");
    outer.addColorStop(1,    "rgba(0, 0, 0, 0)");
    ctx.fillStyle = outer;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh
      position={[0, -radius * 1.15, -0.4]}
      rotation={[-Math.PI / 2.05, 0, 0]}
    >
      <planeGeometry args={[radius * 4.2, radius * 2.2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={1}
      />
    </mesh>
  );
}

function Scene() {
  const pointsRef = useRef();
  const groupRef  = useRef();
  const mouse     = useRef({ x: 9999, y: 9999 });
  const hover     = useRef(false);
  const gOff      = useRef({ x: 0, y: 0 });
  const lastMove  = useRef(Date.now() - 9999);
  const angleX    = useRef(0);
  const angleY    = useRef(0);

  const { base, displace, smoothed, sparkles } = useMemo(
    () => buildSphere(PARTICLE_COUNT, SPHERE_RADIUS), []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(smoothed, 3));
    
    // Sparkle colors array — dynamic shiny core values
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Golden platinum luxury color spectrum
      colors[i * 3]     = 0.98; // R
      colors[i * 3 + 1] = 0.96; // G
      colors[i * 3 + 2] = 0.90; // B
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [smoothed]);

  const sparkleTexture = useMemo(() => {
    const size = 64;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    
    // Shiny bright core star glow
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.1, "rgba(255, 253, 245, 0.9)");
    grad.addColorStop(0.3, "rgba(255, 242, 210, 0.45)");
    grad.addColorStop(0.6, "rgba(255, 230, 180, 0.12)");
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cv);
  }, []);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.056,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    opacity: 0.98,
    blending: THREE.AdditiveBlending,
    alphaMap: sparkleTexture,
  }), [sparkleTexture]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !groupRef.current) return;

    const time = clock.getElapsedTime();
    const idle = Date.now() - lastMove.current > 1200;
    const mx   = mouse.current.x;
    const my   = mouse.current.y;

    if (!idle) {
      gOff.current.x += (mx * 0.12 - gOff.current.x) * 0.022;
      gOff.current.y += (my * 0.10 - gOff.current.y) * 0.022;
    } else {
      gOff.current.x += (0 - gOff.current.x) * 0.015;
      gOff.current.y += (0 - gOff.current.y) * 0.015;
    }
    groupRef.current.position.x = gOff.current.x;
    groupRef.current.position.y = gOff.current.y;

    // Fluid multi-dimensional spin
    angleX.current += ROT_X + Math.sin(time * 0.1) * 0.0001;
    angleY.current += ROT_Y + Math.cos(time * 0.05) * 0.0002;
    const cosX = Math.cos(angleX.current), sinX = Math.sin(angleX.current);
    const cosY = Math.cos(angleY.current), sinY = Math.sin(angleY.current);

    const pos = geometry.attributes.position.array;
    const cols = geometry.attributes.color.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const bx = base[i3], by = base[i3 + 1], bz = base[i3 + 2];

      const y1 =  by * cosX - bz * sinX;
      const z1 =  by * sinX + bz * cosX;
      const x2 =  bx * cosY + z1 * sinY;
      const z2 = -bx * sinY + z1 * cosY;

      if (hover.current) {
        const ddx  = x2 + gOff.current.x - mx;
        const ddy  = y1 + gOff.current.y - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          const f = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          displace[i3]   += (ddx / dist) * f * REPEL_STR;
          displace[i3 + 1] += (ddy / dist) * f * REPEL_STR;
        } else if (dist < ATTRACT_RADIUS && dist > 0.01) {
          const f = 1 - dist / ATTRACT_RADIUS;
          displace[i3]   += (-ddx / dist) * f * ATTRACT_STR;
          displace[i3 + 1] += (-ddy / dist) * f * ATTRACT_STR;
        }
      }

      displace[i3]   *= DAMP;
      displace[i3 + 1] *= DAMP;

      const tx = x2 + displace[i3];
      const ty = y1 + displace[i3 + 1];
      const tz = z2;

      smoothed[i3]   += (tx - smoothed[i3])   * LERP_SPEED;
      smoothed[i3 + 1] += (ty - smoothed[i3 + 1]) * LERP_SPEED;
      smoothed[i3 + 2] += (tz - smoothed[i3 + 2]) * LERP_SPEED;

      pos[i3]   = smoothed[i3];
      pos[i3 + 1] = smoothed[i3 + 1];
      pos[i3 + 2] = smoothed[i3 + 2];

      // Dynamic Shimmering Sparkle effect
      const shimmer = Math.sin(time * 6.5 + sparkles[i] * 12.0) * 0.35 + 0.65;
      cols[i3]     = (0.95 + sparkles[i] * 0.05) * shimmer; // R
      cols[i3 + 1] = (0.92 + sparkles[i] * 0.08) * shimmer; // G
      cols[i3 + 2] = (0.85 + sparkles[i] * 0.15) * shimmer; // B
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <mesh
        onPointerMove={(e) => {
          mouse.current.x = e.point.x;
          mouse.current.y = e.point.y;
          lastMove.current = Date.now();
        }}
        onPointerEnter={() => { hover.current = true;  }}
        onPointerLeave={() => { hover.current = false; }}
      >
        <planeGeometry args={[50, 40]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRef}>
        <points ref={pointsRef} geometry={geometry} material={material} />
        <SoftShadow radius={SPHERE_RADIUS} />
      </group>
    </>
  );
}

export default function FlakesCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[-4, 8, 4]} intensity={2.5} />
        <Scene />
      </Canvas>
    </div>
  );
}

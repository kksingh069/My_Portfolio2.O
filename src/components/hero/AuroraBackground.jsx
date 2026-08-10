"use client";

import { useRef, useEffect } from "react";

/*
 * Each blob: normalized center (bx, by), semi-axes as fraction of canvas
 * dimensions (rx × W, ry × H), slow drift amplitude (dx, dy), and a
 * slight base rotation angle so ellipses are organically tilted.
 */
const BLOBS = [
  { bx: 0.28, by: 0.52, rx: 0.48, ry: 0.26, angle: -0.20, spd: 0.000048, phase: 0.0, alpha: 0.24, dx: 0.15, dy: 0.09 },
  { bx: 0.68, by: 0.44, rx: 0.40, ry: 0.30, angle:  0.30, spd: 0.000036, phase: 2.3, alpha: 0.19, dx: 0.12, dy: 0.13 },
  { bx: 0.50, by: 0.28, rx: 0.58, ry: 0.17, angle: -0.10, spd: 0.000060, phase: 4.7, alpha: 0.14, dx: 0.18, dy: 0.06 },
  { bx: 0.38, by: 0.70, rx: 0.38, ry: 0.22, angle:  0.20, spd: 0.000044, phase: 1.4, alpha: 0.16, dx: 0.10, dy: 0.10 },
  { bx: 0.78, by: 0.60, rx: 0.32, ry: 0.24, angle: -0.40, spd: 0.000055, phase: 3.5, alpha: 0.13, dx: 0.09, dy: 0.12 },
];

export default function AuroraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    function setSize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    function draw(ts) {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const b of BLOBS) {
        const t  = ts * b.spd;
        const cx = (b.bx + Math.sin(t * Math.PI * 2        + b.phase) * b.dx) * W;
        const cy = (b.by + Math.cos(t * Math.PI * 2 * 0.63 + b.phase) * b.dy) * H;
        const rx = b.rx * W;
        const ry = b.ry * H;
        // slow organic tilt over time
        const rot = b.angle + Math.sin(t * Math.PI * 2 * 0.38 + b.phase) * 0.14;

        // Gradient in local unit-circle space, then scaled to rx × ry
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0,   `rgba(255,255,255,${b.alpha})`);
        grad.addColorStop(0.5, `rgba(255,255,255,${+(b.alpha * 0.14).toFixed(4)})`);
        grad.addColorStop(1,   "rgba(255,255,255,0)");

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(rx, ry);
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        filter: "blur(90px)",
      }}
    />
  );
}

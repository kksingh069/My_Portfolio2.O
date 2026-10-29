"use client";

import { useEffect, useRef } from "react";

/**
 * Starfield — a quiet, twinkling night sky behind the footer.
 *
 * • Three depth layers drift gently against the mouse (parallax).
 * • Constellation cursor: stars near the pointer brighten and are linked
 *   to it — and to each other — by hairline threads, under a soft halo.
 *   It eases in when you move and fades away when the pointer leaves.
 *
 * Only animates while the footer is on screen.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fine = !window.matchMedia("(pointer: coarse)").matches;
    let w = 0, h = 0, raf = 0, visible = false;
    let stars = [];
    const par = { x: 0, y: 0, tx: 0, ty: 0 };            // parallax
    const ptr = { x: -999, y: -999, sx: -999, sy: -999, on: 0, inside: false };
    const R = 170;                                       // constellation radius
    const LINK = 90;                                     // star↔star link distance

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 4200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.25,
        z: [0.2, 0.5, 1][Math.floor(Math.random() * 3)],
        t: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 1.6,
        px: 0, py: 0, glow: 0,
      }));
    };

    const draw = (time) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;

      par.x += (par.tx - par.x) * 0.05;
      par.y += (par.ty - par.y) * 0.05;
      ptr.sx += (ptr.x - ptr.sx) * 0.18;
      ptr.sy += (ptr.y - ptr.sy) * 0.18;
      ptr.on += ((ptr.inside ? 1 : 0) - ptr.on) * 0.08;

      ctx.clearRect(0, 0, w, h);
      const t = time / 1000;

      // Soft halo under the pointer
      if (ptr.on > 0.01) {
        const g = ctx.createRadialGradient(ptr.sx, ptr.sy, 0, ptr.sx, ptr.sy, R * 1.6);
        g.addColorStop(0, `rgba(125, 147, 255, ${0.16 * ptr.on})`);
        g.addColorStop(1, "rgba(125, 147, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(ptr.sx - R * 1.6, ptr.sy - R * 1.6, R * 3.2, R * 3.2);
      }

      const near = [];
      for (const s of stars) {
        s.px = s.x - par.x * 18 * s.z;
        s.py = s.y - par.y * 12 * s.z;
        const d = Math.hypot(s.px - ptr.sx, s.py - ptr.sy);
        const target = d < R ? (1 - d / R) * ptr.on : 0;
        s.glow += (target - s.glow) * 0.15;
        if (s.glow > 0.02) near.push(s);
      }

      // Threads: pointer → star, and star ↔ star inside the halo
      if (near.length) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < near.length; i++) {
          const a = near[i];
          ctx.strokeStyle = `rgba(190, 202, 255, ${a.glow * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(ptr.sx, ptr.sy);
          ctx.lineTo(a.px, a.py);
          ctx.stroke();
          for (let j = i + 1; j < near.length; j++) {
            const b = near[j];
            const d = Math.hypot(a.px - b.px, a.py - b.py);
            if (d < LINK) {
              ctx.strokeStyle = `rgba(242, 241, 236, ${Math.min(a.glow, b.glow) * (1 - d / LINK) * 0.55})`;
              ctx.beginPath();
              ctx.moveTo(a.px, a.py);
              ctx.lineTo(b.px, b.py);
              ctx.stroke();
            }
          }
        }
      }

      // Stars
      for (const s of stars) {
        const tw = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.s + s.t));
        const a = Math.min(1, tw * (0.35 + s.z * 0.65) + s.glow);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.glow > 0.2 ? "#cdd6ff" : s.z === 1 && s.r > 1 ? "#9db0ff" : "#f2f1ec";
        ctx.beginPath();
        ctx.arc(s.px, s.py, s.r * (0.6 + s.z * 0.6) * (1 + s.glow * 1.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const onMove = (e) => {
      par.tx = e.clientX / window.innerWidth - 0.5;
      par.ty = e.clientY / window.innerHeight - 0.5;
      if (!fine) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const t = e.target instanceof Element ? e.target : null;
      ptr.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height && !(t && t.closest("[data-trail-off]"));
      if (ptr.sx < -900) { ptr.sx = x; ptr.sy = y; }
      ptr.x = x; ptr.y = y;
    };
    const onLeave = () => { ptr.inside = false; };

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="kks-ft-stars" aria-hidden="true" />;
}

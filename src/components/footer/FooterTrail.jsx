"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ArtTile from "@/components/fx/ArtTile";
import WorkCover from "@/components/works/WorkCover";

/* Screens in the ribbon — index 0 sits by the button, the last one by the cursor */
const CARDS = [
  { type: "art",  kind: "grid" },
  { type: "art",  kind: "wave" },
  { type: "work", kind: "monolith", title: "Monolith" },
  { type: "art",  kind: "blocks" },
  { type: "work", kind: "pulse",  title: "Pulse" },
  { type: "art",  kind: "orbit" },
  { type: "work", kind: "drift",  title: "Drift" },
  { type: "art",  kind: "mesh" },
  { type: "work", kind: "aether", title: "Aether" },
];
const N = CARDS.length;

/**
 * FooterTrail — project screens fan out of the CTA button toward the cursor.
 *
 * Move the mouse in the footer and a ribbon of screens unfurls from behind
 * the button, stretching to wherever the pointer is (cards near the cursor
 * are larger and brighter, cards near the button smaller and fainter).
 * Stop moving — or leave — and the whole ribbon folds back into the button.
 *
 * zoneRef:   positioned element the effect lives in (and is clipped by)
 * anchorRef: the button the ribbon grows out of
 */
export default function FooterTrail({ zoneRef, anchorRef }) {
  const cardRefs = useRef([]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || window.matchMedia("(pointer: coarse)").matches) return;

    const mouse = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };          // lagged cursor the ribbon reaches for
    const cards = CARDS.map(() => ({ x: 0, y: 0, vx: 0 }));
    let open = 0;                          // 0 = folded into the button, 1 = fully out
    let lastMove = -1e9;
    let inside = false;
    let primed = false;

    const anchorPoint = () => {
      const a = anchorRef.current;
      const z = zone.getBoundingClientRect();
      if (!a) return { x: 0, y: 0 };
      const r = a.getBoundingClientRect();
      // the icon box on the left of the button
      return { x: r.left - z.left + 34, y: r.top - z.top + r.height / 2 };
    };

    const onMove = (e) => {
      const z = zone.getBoundingClientRect();
      mouse.x = e.clientX - z.left;
      mouse.y = e.clientY - z.top;
      const t = e.target instanceof Element ? e.target : null;
      inside = !(t && t.closest("[data-trail-off]"));
      lastMove = performance.now();
      if (!primed) {
        const a = anchorPoint();
        head.x = a.x; head.y = a.y;
        cards.forEach((c) => { c.x = a.x; c.y = a.y; });
        primed = true;
      }
    };
    const onLeave = () => { inside = false; };

    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);

    const tick = () => {
      if (!primed) return;
      const now = performance.now();
      const active = inside && now - lastMove < 650;
      open += ((active ? 1 : 0) - open) * (active ? 0.12 : 0.09);

      const a = anchorPoint();
      head.x += (mouse.x - head.x) * 0.16;
      head.y += (mouse.y - head.y) * 0.16;

      for (let i = 0; i < N; i++) {
        const c = cards[i];
        const f = (i + 1) / N;                     // 0..1 along the ribbon
        // point along anchor → head, bowed upward a little so it reads as an arc
        const bow = Math.sin(f * Math.PI) * -40 * open;
        const tx = a.x + (head.x - a.x) * f * open;
        const ty = a.y + (head.y - a.y) * f * open + bow;
        // farther cards chase more slowly → the ribbon curves while moving
        const k = 0.28 - f * 0.14;
        const nx = c.x + (tx - c.x) * k;
        c.vx = nx - c.x;
        c.x = nx;
        c.y += (ty - c.y) * k;

        const el = cardRefs.current[i];
        if (!el) continue;
        const s = (0.5 + 0.5 * f) * (0.35 + 0.65 * open);
        const tilt = gsap.utils.clamp(-16, 16, c.vx * 1.2);
        el.style.transform =
          `translate3d(${c.x}px, ${c.y}px, 0) rotateY(-26deg) rotateZ(${-5 + tilt}deg) scale(${s})`;
        el.style.opacity = String(Math.min(1, open * 1.4) * (0.22 + 0.78 * f));
      }
    };
    gsap.ticker.add(tick);

    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, [zoneRef, anchorRef]);

  return (
    <div className="kks-trail" aria-hidden="true">
      {CARDS.map((c, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className="kks-trail-card"
          style={{ zIndex: i + 1, opacity: 0 }}
        >
          <div className="kks-trail-screen">
            {c.type === "work" ? <WorkCover kind={c.kind} title={c.title} /> : <ArtTile kind={c.kind} fit="slice" />}
          </div>
        </div>
      ))}
    </div>
  );
}

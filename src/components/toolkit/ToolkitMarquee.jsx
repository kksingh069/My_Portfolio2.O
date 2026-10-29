"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOOLKIT_A, TOOLKIT_B } from "@/lib/content";
import "./toolkit.css";

gsap.registerPlugin(ScrollTrigger);

function Star() {
  return (
    <svg className="kks-tk-star" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" fill="currentColor" />
    </svg>
  );
}

function Row({ items, outline }) {
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div className={`kks-tk-row${outline ? " is-outline" : ""}`}>
      <div className="kks-tk-inner">
        {seq.map((t, i) => (
          <span key={i} className="kks-tk-item">
            {t}
            <Star />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Toolkit — two infinite marquees running in opposite directions.
 * Scroll velocity speeds them up and flips direction; they skew slightly
 * with speed, then ease back to calm.
 */
export default function ToolkitMarquee() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const rows = gsap.utils.toArray(".kks-tk-inner", sectionRef.current);
    const wrap = gsap.utils.wrap(-25, 0); // content repeated 4x → loop every 25%
    const pos = [0, -12.5];
    const dir = [1, -1]; // row 1 drifts left, row 2 drifts right
    let scrollDir = 1;
    let boost = 1;
    const BASE = 1.6; // % of row width per second

    const skewTo = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3.out" });
    const settle = gsap.delayedCall(0.15, () => skewTo(0)).pause();

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = self.getVelocity();
        scrollDir = self.direction;
        boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 350);
        skewTo(gsap.utils.clamp(-8, 8, v / -300));
        settle.restart(true); // straighten up once scrolling stops
      },
      onLeave: () => skewTo(0),
      onLeaveBack: () => skewTo(0),
    });

    const tick = (time, deltaTime) => {
      const dt = Math.min(deltaTime, 50) / 1000;
      boost += (1 - boost) * 0.04; // ease back to cruising speed
      rows.forEach((row, i) => {
        pos[i] = wrap(pos[i] - BASE * boost * dir[i] * scrollDir * dt);
        gsap.set(row, { xPercent: pos[i] });
      });
    };
    gsap.ticker.add(tick);

    return () => {
      st.kill();
      settle.kill();
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <section ref={sectionRef} className="kks-tk-section" data-no-fade data-header="dark" aria-label="Toolkit">
      <div className="kks-tk-label">
        <span className="kks-eyebrow">(06) — Toolkit</span>
        <span className="kks-tk-label-right">Scroll faster ↓</span>
      </div>
      <Row items={TOOLKIT_A} />
      <Row items={TOOLKIT_B} outline />
    </section>
  );
}

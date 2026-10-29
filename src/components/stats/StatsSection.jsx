"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./stats.css";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 3,   suffix: "+", label: "Years crafting\ndigital experiences" },
  { value: 40,  suffix: "+", label: "Projects shipped\nend-to-end" },
  { value: 20,  suffix: "+", label: "Happy clients\nworldwide" },
  { value: 100, suffix: "%", label: "Pixel-perfect\ndelivery, always" },
];

export default function StatsSection() {
  const sectionRef  = useRef(null);
  const dividerRef  = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;

      // ── Eyebrow fade up ──────────────────────────────────────
      gsap.from(".kks-stats-eyebrow", {
        y: 20,
        autoAlpha: 0,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });

      // ── Headline clip reveal (each line slides up from mask) ──
      gsap.from(".kks-stats-hl-inner", {
        yPercent: 108,
        duration: 1.4,
        stagger: 0.14,
        ease: "power4.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });

      // ── Divider scaleX reveal ────────────────────────────────
      gsap.fromTo(dividerRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
        }
      );

      // ── Stat items: stagger from bottom ─────────────────────
      gsap.from(".kks-stat-item", {
        y: 60,
        autoAlpha: 0,
        duration: 1.1,
        stagger: { amount: 0.5, from: "start" },
        ease: "power4.out",
        scrollTrigger: { trigger: ".kks-stats-grid", start: "top 85%", once: true },
      });

      // ── Stat rules scaleX ────────────────────────────────────
      gsap.from(".kks-stat-rule", {
        scaleX: 0,
        duration: 1.0,
        stagger: { amount: 0.4, from: "start" },
        ease: "power3.out",
        scrollTrigger: { trigger: ".kks-stats-grid", start: "top 82%", once: true },
      });

      // ── CountUp per stat ─────────────────────────────────────
      document.querySelectorAll(".kks-stat-count").forEach((el) => {
        const end = parseInt(el.dataset.value, 10);
        gsap.from(el, {
          textContent: 0,
          duration: 2.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate() {
            el.textContent = Math.round(parseFloat(el.textContent));
          },
        });
      });

      // ── Labels fade up ───────────────────────────────────────
      gsap.from(".kks-stat-label", {
        y: 18,
        autoAlpha: 0,
        duration: 0.9,
        stagger: { amount: 0.4, from: "start" },
        ease: "power3.out",
        delay: 0.3,
        scrollTrigger: { trigger: ".kks-stats-grid", start: "top 82%", once: true },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="kks-stats-section" data-header="dark">
      <div className="kks-stats-inner">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="kks-stats-header">
          <span className="kks-stats-eyebrow">— by the numbers</span>
          <h2 className="kks-stats-headline">
            <span className="kks-stats-hl-clip">
              <span className="kks-stats-hl-inner">The Work</span>
            </span>
            <span className="kks-stats-hl-clip">
              <span className="kks-stats-hl-inner">Speaks.</span>
            </span>
          </h2>
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div ref={dividerRef} className="kks-stats-divider" />

        {/* ── Stat grid ───────────────────────────────────── */}
        <div className="kks-stats-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="kks-stat-item">
              <div className="kks-stat-rule" />
              <div className="kks-stat-number">
                <span
                  className="kks-stat-count"
                  data-value={stat.value}
                >
                  {stat.value}
                </span>
                <span className="kks-stat-suffix">{stat.suffix}</span>
              </div>
              <div className="kks-stat-label">
                {stat.label.split("\n").map((line, j) => (
                  <span key={j} style={{ display: "block" }}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

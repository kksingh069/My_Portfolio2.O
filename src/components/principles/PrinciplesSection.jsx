"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRINCIPLES } from "@/lib/content";
import "./principles.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Principles — a Swiss / International Typographic Style poster.
 * Visible 12-column grid, flush-left grotesk, one red circle, numbered
 * principles, a type specimen and swatch strip. Everything snaps onto
 * the grid as you scroll in.
 */
export default function PrinciplesSection() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: ref.current, start: "top 70%", once: true };

      // Grid lines draw down
      gsap.from(".kks-sw-gridline", {
        scaleY: 0, transformOrigin: "top", duration: 1.4, stagger: 0.04, ease: "power3.inOut", scrollTrigger: st,
      });
      // Headline lines slide in from the left edge of their masks
      gsap.from(".kks-sw-hl-inner", {
        xPercent: -105, duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.2, scrollTrigger: st,
      });
      // Red circle grows on scroll, then drifts (controlled parallax)
      gsap.fromTo(".kks-sw-circle", { scale: 0 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 85%", end: "top 15%", scrub: 1.2 },
      });
      gsap.to(".kks-sw-circle", {
        yPercent: -35, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
      // Rule lines and principles
      gsap.from(".kks-sw-rule", {
        scaleX: 0, transformOrigin: "left", duration: 1.1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".kks-sw-list", start: "top 80%", once: true },
      });
      gsap.from(".kks-sw-item > *", {
        y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.05, ease: "power3.out",
        scrollTrigger: { trigger: ".kks-sw-list", start: "top 78%", once: true },
      });
      gsap.from(".kks-sw-foot > *", {
        y: 40, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".kks-sw-foot", start: "top 90%", once: true },
      });
      // Vertical caption scrolls against the page
      gsap.fromTo(".kks-sw-vertical", { yPercent: 20 }, {
        yPercent: -20, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="kks-sw-section" id="principles" data-header="light">
      {/* 12-column grid, visible like a poster's construction lines */}
      <div className="kks-sw-grid" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => <span key={i} className="kks-sw-gridline" />)}
      </div>

      <div className="kks-sw-circle" aria-hidden="true" />
      <span className="kks-sw-vertical" aria-hidden="true">Principles — Swiss edition — No. 04 — 2026</span>

      <div className="kks-sw-inner">
        <header className="kks-sw-head">
          <span className="kks-sw-label"><i />(04) Principles</span>
          <span className="kks-sw-label kks-sw-label--r">Neue grid / 12 col / 24 gutter</span>
        </header>

        <h2 className="kks-sw-title">
          <span className="kks-sw-hl"><span className="kks-sw-hl-inner">Form</span></span>
          <span className="kks-sw-hl"><span className="kks-sw-hl-inner">follows</span></span>
          <span className="kks-sw-hl"><span className="kks-sw-hl-inner">function<b>.</b></span></span>
        </h2>

        <ol className="kks-sw-list">
          {PRINCIPLES.map((p) => (
            <li key={p.no} className="kks-sw-item">
              <span className="kks-sw-rule" aria-hidden="true" />
              <span className="kks-sw-no">{p.no}</span>
              <h3 className="kks-sw-item-t">{p.title}</h3>
              <p className="kks-sw-item-b">{p.body}</p>
            </li>
          ))}
        </ol>

        <div className="kks-sw-foot">
          <div className="kks-sw-specimen">
            <span className="kks-sw-aa">Aa</span>
            <span className="kks-sw-spec-meta">Grotesk<br />800 / −5% / 0.9</span>
          </div>
          <div className="kks-sw-swatches">
            <span style={{ "--c": "#0a0a0a" }}><b>Ink</b>#0A0A0A</span>
            <span style={{ "--c": "#f4f3ef" }} className="is-light"><b>Paper</b>#F4F3EF</span>
            <span style={{ "--c": "#e5321c" }}><b>Signal</b>#E5321C</span>
            <span style={{ "--c": "#2b4bff" }}><b>Blue</b>#2B4BFF</span>
          </div>
          <p className="kks-sw-quote">“Less, but better.”<span>— the rule I design by</span></p>
        </div>
      </div>
    </section>
  );
}

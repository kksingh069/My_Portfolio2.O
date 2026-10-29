"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAPABILITIES } from "@/lib/content";
import ArtTile from "@/components/fx/ArtTile";
import "./capabilities.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Capabilities — a staggered, indented service list (Mondragon-style).
 * Rows enter one after another; hovering a row inverts it into a black
 * tag and a preview card trails the cursor with inertia.
 */
export default function CapabilitiesSection() {
  const sectionRef = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title words rise from their masks
      gsap.from(".kks-cap-title-inner", {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });

      // Staggered scroll: each row slides in from its indent with a delay cascade
      gsap.from(".kks-cap-row", {
        x: -60,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: ".kks-cap-list", start: "top 80%", once: true },
      });

      // Controlled parallax on the big ghost number
      gsap.to(".kks-cap-ghost", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, sectionRef);

    // Preview card follows the cursor with inertia
    const preview = previewRef.current;
    const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3.out" });
    const rTo = gsap.quickTo(preview, "rotation", { duration: 0.9, ease: "power3.out" });
    let lastX = 0;
    const onMove = (e) => {
      const rect = sectionRef.current.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6)); // tilt with velocity
      lastX = e.clientX;
    };
    const section = sectionRef.current;
    section.addEventListener("mousemove", onMove);

    return () => {
      ctx.revert();
      section.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className="kks-cap-section" id="capabilities" data-header="light">
      <span className="kks-crop kks-crop--tl" />
      <span className="kks-crop kks-crop--tr" />

      <div className="kks-cap-ghost" aria-hidden="true">06</div>

      <header className="kks-cap-header">
        <span className="kks-eyebrow">(02) — Capabilities</span>
        <h2 className="kks-cap-title">
          <span className="kks-cap-title-clip"><span className="kks-cap-title-inner">Things I’m</span></span>
          <span className="kks-cap-title-clip"><span className="kks-cap-title-inner"><em>obsessed</em> with.</span></span>
        </h2>
        <p className="kks-cap-intro">
          Half designer, half engineer. I sit where taste meets code — so nothing gets lost
          in the handoff between a beautiful idea and a fast, working product.
        </p>
      </header>

      <ul className="kks-cap-list" onMouseLeave={() => setActive(-1)}>
        {CAPABILITIES.map((cap, i) => (
          <li
            key={cap.title}
            className={`kks-cap-row${active === i ? " is-active" : ""}`}
            style={{ "--indent": cap.indent }}
            onMouseEnter={() => setActive(i)}
          >
            <span className="kks-cap-note">
              <span className="kks-cap-idx">{String(i + 1).padStart(2, "0")}</span>
              {cap.note}
            </span>
            <span className="kks-cap-name">{cap.title}</span>
            <span className="kks-cap-tags">
              {cap.tags.map((t) => <span key={t}>{t}</span>)}
            </span>
          </li>
        ))}
      </ul>

      {/* Cursor-trailing preview */}
      <div ref={previewRef} className={`kks-cap-preview${active >= 0 ? " is-visible" : ""}`} aria-hidden="true">
        <div className="kks-cap-preview-stack" style={{ transform: `translateY(${-Math.max(active, 0) * (100 / CAPABILITIES.length)}%)` }}>
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="kks-cap-preview-item">
              <ArtTile kind={cap.art} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

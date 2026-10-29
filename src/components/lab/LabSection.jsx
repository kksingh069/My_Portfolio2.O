"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LAB } from "@/lib/content";
import "./lab.css";

gsap.registerPlugin(ScrollTrigger);

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ";

/** Decode text from random glyphs → final string */
function scramble(el, final, duration = 1.2) {
  const len = final.length;
  const obj = { p: 0 };
  return gsap.to(obj, {
    p: 1,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      const reveal = Math.floor(obj.p * len);
      let out = "";
      for (let i = 0; i < len; i++) {
        if (final[i] === " ") out += " ";
        else if (i < reveal) out += final[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
    },
    onComplete: () => { el.textContent = final; },
  });
}

function Visual({ kind }) {
  if (kind === "cube") {
    return (
      <div className="kks-lab-v kks-lab-cube-wrap">
        <div className="kks-lab-cube">
          {["f", "b", "l", "r", "t", "d"].map((f) => <span key={f} className={`kks-lab-face kks-lab-face--${f}`} />)}
        </div>
      </div>
    );
  }
  if (kind === "radar") {
    return (
      <div className="kks-lab-v kks-lab-radar">
        <span className="kks-lab-radar-sweep" />
        {[[30, 40], [64, 28], [52, 70], [22, 66]].map(([x, y], i) => (
          <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
    );
  }
  if (kind === "orbit") {
    return (
      <div className="kks-lab-v kks-lab-atom">
        <span className="kks-lab-core" />
        {[0, 60, 120].map((r, i) => (
          <span key={r} className="kks-lab-ring" style={{ "--r": `${r}deg`, "--d": `${3 + i}s` }}><i /></span>
        ))}
      </div>
    );
  }
  return (
    <div className="kks-lab-v kks-lab-wave">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${-(i * 0.11).toFixed(2)}s` }} />
      ))}
    </div>
  );
}

function LabCard({ exp }) {
  const ref = useRef(null);
  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 14);
      rx(-(py - 0.5) * 14);
      card.style.setProperty("--gx", `${px * 100}%`);
      card.style.setProperty("--gy", `${py * 100}%`);
    };
    const leave = () => { rx(0); ry(0); };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);
    return () => {
      card.removeEventListener("mousemove", move);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <article ref={ref} className="kks-lab-card">
      <span className="kks-lab-card-glare" aria-hidden="true" />
      <div className="kks-lab-card-top">
        <span className="kks-lab-id">{exp.id}</span>
        <span className={`kks-lab-status is-${exp.status.toLowerCase().replace(/[^a-z]/g, "")}`}>
          <i />{exp.status}
        </span>
      </div>
      <Visual kind={exp.visual} />
      <h3 className="kks-lab-card-t" data-final={exp.title}>{exp.title}</h3>
      <p className="kks-lab-card-n">{exp.note}</p>
      <span className="kks-lab-corner kks-lab-corner--tl" />
      <span className="kks-lab-corner kks-lab-corner--br" />
    </article>
  );
}

/**
 * Lab — a futuristic HUD: neon grid floor rushing toward you, scanlines,
 * live system readouts (real FPS + pointer coords), titles that decode
 * from glyphs, and holographic experiment cards that tilt with a glare.
 */
export default function LabSection() {
  const ref = useRef(null);
  const fpsRef = useRef(null);
  const xyRef = useRef(null);

  useEffect(() => {
    const section = ref.current;
    const ctx = gsap.context(() => {
      const title = section.querySelector(".kks-lab-title-text");
      ScrollTrigger.create({
        trigger: section,
        start: "top 65%",
        once: true,
        onEnter: () => {
          scramble(title, title.dataset.final, 1.4);
          section.querySelectorAll(".kks-lab-card-t").forEach((el, i) => {
            gsap.delayedCall(0.5 + i * 0.15, () => scramble(el, el.dataset.final, 1));
          });
        },
      });
      gsap.from(".kks-lab-card", {
        y: 80, autoAlpha: 0, rotationX: -25, transformOrigin: "50% 100%",
        duration: 1.2, stagger: 0.12, ease: "power4.out",
        scrollTrigger: { trigger: ".kks-lab-grid", start: "top 85%", once: true },
      });
      gsap.from(".kks-lab-hud > *", {
        autoAlpha: 0, x: 20, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });
      // Floor tilts flatter as you scroll through (parallax depth)
      gsap.fromTo(".kks-lab-floor", { rotationX: 78 }, {
        rotationX: 68, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, section);

    // Live FPS readout
    let frames = 0, last = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 500) {
        if (fpsRef.current) fpsRef.current.textContent = String(Math.round((frames * 1000) / (now - last))).padStart(3, "0");
        frames = 0; last = now;
      }
    };
    gsap.ticker.add(tick);

    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      if (xyRef.current) {
        xyRef.current.textContent =
          `${String(Math.round(e.clientX - r.left)).padStart(4, "0")} · ${String(Math.round(e.clientY - r.top)).padStart(4, "0")}`;
      }
    };
    section.addEventListener("pointermove", onMove);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      section.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section ref={ref} className="kks-lab-section" id="lab" data-header="dark">
      <div className="kks-lab-floor-wrap" aria-hidden="true"><div className="kks-lab-floor" /></div>
      <div className="kks-lab-horizon" aria-hidden="true" />
      <div className="kks-lab-scan" aria-hidden="true" />

      <span className="kks-lab-bracket kks-lab-bracket--tl" />
      <span className="kks-lab-bracket kks-lab-bracket--tr" />
      <span className="kks-lab-bracket kks-lab-bracket--bl" />
      <span className="kks-lab-bracket kks-lab-bracket--br" />

      <div className="kks-lab-inner">
        <header className="kks-lab-head">
          <div>
            <span className="kks-lab-eyebrow">// (06) The Lab — experiments</span>
            <h2 className="kks-lab-title">
              <span className="kks-lab-title-text" data-final="THE LAB">THE LAB</span>
              <span className="kks-lab-title-ghost" aria-hidden="true">THE LAB</span>
            </h2>
            <p className="kks-lab-sub">
              Prototypes, shaders and odd ideas I build after hours —
              where new techniques get tested before they reach client work.
            </p>
          </div>

          <dl className="kks-lab-hud">
            <div><dt>SYS.STATUS</dt><dd><i className="kks-lab-dot" />ONLINE</dd></div>
            <div><dt>RENDER</dt><dd><span ref={fpsRef}>060</span> FPS</dd></div>
            <div><dt>POINTER</dt><dd ref={xyRef}>0000 · 0000</dd></div>
            <div><dt>BUILD</dt><dd>v26.10 / NEXT</dd></div>
          </dl>
        </header>

        <div className="kks-lab-grid">
          {LAB.map((exp) => <LabCard key={exp.id} exp={exp} />)}
        </div>
      </div>
    </section>
  );
}

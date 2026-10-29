"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/content";
import "./preloader.css";

const STEPS = [
  [0, "Waking up the grid"],
  [22, "Loading typefaces"],
  [48, "Compiling shaders"],
  [72, "Choreographing motion"],
  [94, "Ready"],
];

// The word that grows out of the centre line: ideas being forged into code.
const LOADER_WORD = "FORGING";

const MIN_MS = 2600;   // never shorter — gives the reveal room to breathe
const MAX_MS = 7000;   // never longer — even on a very slow connection

/**
 * Preloader — "the split".
 *
 * A hairline drops through the centre of the screen. The word FORGING grows
 * OUT of that line in both directions as real loading progresses (fonts +
 * page load), so the reveal IS the progress bar. A live counter sits under
 * the line's dot, and status lines tell you what's happening.
 * At 100 the screen parts down the line like two doors and the site appears.
 *
 * Plays on every page load (skipped only for visitors who prefer reduced motion).
 */
export default function Preloader() {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const statusRef = useRef(null);
  const timeRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finish = () => {
      // All sections have mounted by now — re-sort pins and recalc positions
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      window.__kksLoaded = true;
      window.dispatchEvent(new Event("kks:loaded"));
    };

    const seen = document.documentElement.classList.contains("kks-seen");
    if (seen) {
      setDone(true);
      const raf = requestAnimationFrame(finish); // after sibling sections mount
      return () => cancelAnimationFrame(raf);
    }

    const root = rootRef.current;
    const smoother = () => ScrollSmoother.get();
    requestAnimationFrame(() => smoother()?.paused(true));

    // Live clock in the corner
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: SITE.timezone,
    });
    const clock = () => { if (timeRef.current) timeRef.current.textContent = fmt.format(new Date()); };
    clock();
    const clockId = setInterval(clock, 1000);

    // ── Real progress signals ─────────────────────────────
    let target = 12; // DOM is ready by the time this runs
    const bump = (v) => { target = Math.max(target, v); };
    document.fonts?.ready.then(() => bump(55));
    const onLoad = () => bump(100);
    if (document.readyState === "complete") bump(100);
    else window.addEventListener("load", onLoad);

    const t0 = performance.now();
    const state = { p: 0 };
    let stepIdx = -1;
    let exiting = false;
    let queued = false;

    // ── Intro: line drops in, dot lands, corners fade up ──
    const intro = gsap.timeline();
    intro
      .fromTo(".kpl-line", { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "expo.out" })
      .fromTo(".kpl-dot", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(3)" }, "-=0.45")
      .from(".kpl-meta > *", { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, "-=0.5")
      .from(".kpl-count, .kpl-tag", { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, "-=0.6");

    const setStatus = (text) => {
      const el = statusRef.current;
      if (!el) return;
      gsap.to(el, {
        yPercent: -100, autoAlpha: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => {
          el.textContent = text;
          gsap.fromTo(el, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" });
        },
      });
    };

    const exit = () => {
      exiting = true;
      gsap.ticker.remove(tick);

      const tl = gsap.timeline({
        onComplete: () => {
          smoother()?.paused(false);
          setDone(true);
        },
      });
      tl.to(".kpl-word", { letterSpacing: "-0.075em", duration: 0.7, ease: "power3.inOut" }, 0)
        .to(".kpl-dot", { scale: 2.2, duration: 0.35, ease: "power2.out" }, 0.1)
        .to(".kpl-dot", { scale: 0, duration: 0.35, ease: "power2.in" }, 0.45)
        .to(".kpl-count, .kpl-tag, .kpl-status-wrap, .kpl-bar, .kpl-meta > *", { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.02, ease: "power2.in" }, 0.2)
        .to(".kpl-line", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.5, ease: "expo.in" }, 0.45)
        .add(finish, 0.85)
        .to(".kpl-door--l", { xPercent: -101, duration: 1.25, ease: "expo.inOut" }, 0.85)
        .to(".kpl-door--r", { xPercent: 101, duration: 1.25, ease: "expo.inOut" }, 0.85)
        .to(".kpl-word", { scale: 1.12, duration: 1.25, ease: "expo.inOut" }, 0.85)
        .set(root, { display: "none" });
    };

    // ── Each frame: displayed % chases real progress, but never faster
    //    than the minimum duration allows ──
    const tick = () => {
      if (exiting) return;
      const elapsed = performance.now() - t0;
      if (elapsed > MAX_MS) bump(100);
      const cap = Math.min(100, (elapsed / MIN_MS) * 100);
      const goal = Math.min(target, cap);
      state.p += (goal - state.p) * 0.08;
      if (goal >= 100 && state.p > 99.5) state.p = 100;

      const v = Math.round(state.p);
      root.style.setProperty("--p", (state.p / 100).toFixed(4));
      if (countRef.current) countRef.current.textContent = String(v).padStart(3, "0");

      const next = STEPS.reduce((acc, [at], i) => (v >= at ? i : acc), 0);
      if (next !== stepIdx) { stepIdx = next; setStatus(STEPS[next][1]); }

      if (state.p >= 100 && !queued) { queued = true; gsap.delayedCall(0.25, exit); }
    };
    gsap.ticker.add(tick);

    return () => {
      intro.kill();
      gsap.ticker.remove(tick);
      clearInterval(clockId);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (done) return null;

  // Same logotype in both doors: a faint outline "waiting" + the solid fill that grows from the line
  const word = (
    <>
      <span className="kpl-word kpl-word--ghost">{LOADER_WORD}</span>
      <span className="kpl-word kpl-word--fill">{LOADER_WORD}</span>
    </>
  );

  return (
    <div ref={rootRef} className="kpl" aria-hidden="true" style={{ "--p": 0 }}>
      {/* Two doors — each holds the full word, the door edge splits it on the line */}
      <div className="kpl-door kpl-door--l">
        <div className="kpl-grid" />
        <div className="kpl-stage kpl-stage--l">{word}</div>
      </div>
      <div className="kpl-door kpl-door--r">
        <div className="kpl-grid" />
        <div className="kpl-stage kpl-stage--r">{word}</div>
      </div>

      {/* Centre line + dot + counter */}
      <div className="kpl-center">
        <span className="kpl-line" />
        <span className="kpl-dot" />
        <div className="kpl-count"><span ref={countRef}>000</span><i>%</i></div>
        <p className="kpl-tag">Crafting the <em>experience</em></p>
        <div className="kpl-status-wrap"><span ref={statusRef} className="kpl-status">Waking up the grid</span></div>
        <span className="kpl-bar" />
      </div>

      {/* Corner meta */}
      <div className="kpl-meta">
        <span className="kpl-m kpl-m--tl">{SITE.name}</span>
        <span className="kpl-m kpl-m--tr">Portfolio — Edition 2026</span>
        <span className="kpl-m kpl-m--bl">IST <b ref={timeRef}>--:--:--</b></span>
        <span className="kpl-m kpl-m--br">{SITE.role} — {SITE.location}</span>
      </div>
    </div>
  );
}

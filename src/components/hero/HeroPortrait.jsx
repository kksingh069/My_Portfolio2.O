"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* ─────────────────────────────────────────────────────────────
   HeroPortrait — "filmstrip" head that follows the cursor.

   65 frames cut from a head-turn render live in /public/hero/head
   (00 = looking far left … 64 = looking far right). The cursor's X
   position picks a target frame; the drawn frame eases toward it
   every tick, so the head turns smoothly instead of snapping.
   The portrait tilts a few degrees in 3D with the cursor.
   It only ever moves when the pointer moves — no idle animation.
   ───────────────────────────────────────────────────────────── */

const FRAME_COUNT = 65;
const FRONT = 32;                 // frame where he looks straight at you
const src = (i) => `/hero/head/${String(i).padStart(2, "0")}.webp`;

export default function HeroPortrait({ ready }) {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const yawRef = useRef(null);
  const knobRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Load frames (front frame first so something shows instantly) ──
    const imgs = new Array(FRAME_COUNT);
    const loaded = new Array(FRAME_COUNT).fill(false);
    const order = [FRONT, ...Array.from({ length: FRAME_COUNT }, (_, i) => i).filter((i) => i !== FRONT)];
    let alive = true;
    order.forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!alive) return;
        loaded[i] = true;
        if (i === FRONT) { draw(FRONT, true); card.classList.add("is-loaded"); }
      };
      img.src = src(i);
      imgs[i] = img;
    });

    // ── Canvas sizing (crisp on retina) ──
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw(Math.round(state.cur), true);
    };

    const nearestLoaded = (i) => {
      if (loaded[i]) return i;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (loaded[i - d]) return i - d;
        if (loaded[i + d]) return i + d;
      }
      return -1;
    };

    let lastDrawn = -1;
    const draw = (i, force = false) => {
      const f = nearestLoaded(Math.max(0, Math.min(FRAME_COUNT - 1, i)));
      if (f < 0 || (!force && f === lastDrawn)) return;
      const img = imgs[f];
      const cw = canvas.width, ch = canvas.height;
      if (!cw || !ch) return;
      // object-fit: cover
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);           // frames are transparent cut-outs
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawn = f;
      if (frameRef.current) frameRef.current.textContent = String(f + 1).padStart(2, "0");
    };

    // ── Cursor → target frame (piecewise so screen-centre = looking at you) ──
    const state = { cur: FRONT, target: FRONT };
    const frameForX = (nx) => (nx < 0.5 ? nx * 2 * FRONT : FRONT + (nx - 0.5) * 2 * (FRAME_COUNT - 1 - FRONT));

    const tiltX = gsap.quickTo(card, "rotationX", { duration: 1.2, ease: "power3.out" });
    const tiltY = gsap.quickTo(card, "rotationY", { duration: 1.2, ease: "power3.out" });

    // Only a real pointer movement may turn the head. Browsers also fire
    // pointermove when the page scrolls under a resting cursor — same
    // coordinates, so those are ignored here.
    let lastX = null, lastY = null;
    const onMove = (e) => {
      if (!e.isTrusted) return;
      if (e.clientX === lastX && e.clientY === lastY) return;
      lastX = e.clientX; lastY = e.clientY;
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      state.target = frameForX(nx);
      if (!reduce && e.pointerType !== "touch") {
        tiltY((nx - 0.5) * 10);
        tiltX((0.5 - ny) * 6);
      }
    };
    // pointermove covers mouse, pen and touch-drag
    window.addEventListener("pointermove", onMove, { passive: true });

    // ── Tick: ease toward the target the cursor set (nothing else moves it) ──
    const tick = () => {
      if (Math.abs(state.target - state.cur) < 0.01) return;
      state.cur += (state.target - state.cur) * 0.12;
      const f = Math.round(state.cur);
      draw(f);

      // HUD: yaw readout + knob along the rail
      const yaw = f <= FRONT ? -((FRONT - f) / FRONT) * 50 : ((f - FRONT) / (FRAME_COUNT - 1 - FRONT)) * 50;
      if (yawRef.current) yawRef.current.textContent = `${yaw >= 0 ? "+" : "−"}${String(Math.abs(Math.round(yaw))).padStart(2, "0")}°`;
      if (knobRef.current) knobRef.current.style.left = `${(state.cur / (FRAME_COUNT - 1)) * 100}%`;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) gsap.ticker.add(tick);

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Entrance once the preloader has gone
  useEffect(() => {
    if (!ready) return;
    const tl = gsap.timeline({ delay: 0.35 });
    tl.fromTo(".kks-hp-card",
      { clipPath: "inset(100% 0% 0% 0% round 28px)", y: 60 },
      { clipPath: "inset(0% 0% 0% 0% round 28px)", y: 0, duration: 1.5, ease: "expo.out" })
      .fromTo(".kks-hp-canvas", { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0)
      .fromTo(".kks-hp-ghost span", { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.04, ease: "expo.out" }, 0.1)
      .set(".kks-hp-ghost", { visibility: "visible" }, 0)
      .fromTo(".kks-hp-hud > *", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.9);
    return () => tl.kill();
  }, [ready]);

  return (
    <div ref={stageRef} className={`kks-hp${ready ? " is-ready" : ""}`} aria-label="Krishna, rendered in 3D — he follows your cursor">
      {/* Ghost word behind the portrait */}
      <div className="kks-hp-ghost" aria-hidden="true">
        {"VISIONARY".split("").map((c, i) => <span key={i}>{c}</span>)}
      </div>

      <div className="kks-hp-float">
        <div ref={cardRef} className="kks-hp-card" data-cursor="Hi there">
          <canvas ref={canvasRef} className="kks-hp-canvas" />

          <div className="kks-hp-hud" aria-hidden="true">
            <span className="kks-hp-tag kks-hp-tag--tl"><i />Live render</span>
            <span className="kks-hp-tag kks-hp-tag--tr">KKS_v1 · F<b ref={frameRef}>33</b>/65</span>
            <div className="kks-hp-rail">
              <span className="kks-hp-rail-k">Yaw <b ref={yawRef}>+00°</b></span>
              <span className="kks-hp-rail-track"><span ref={knobRef} className="kks-hp-rail-knob" /></span>
              <span className="kks-hp-rail-k">Move your cursor</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

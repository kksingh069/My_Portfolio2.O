"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer } from "gsap/all";
import dynamic from "next/dynamic";
import { SITE } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer);

const LiquidEther = dynamic(() => import("./LiquidEther"), { ssr: false });

const STATEMENT =
  "I design, build and ship digital experiences that blend cinematic motion, immersive interaction and technical precision — from first sketch to production, every pixel intentional, every interaction purposeful.";

const FACTS = [
  { k: "Currently", v: "Building immersive web" },
  { k: "Focus", v: "WebGL · Motion · UI" },
  { k: "Based in", v: `${SITE.location} — remote friendly` },
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  const pathRef    = useRef(null);
  const tipRef     = useRef(null);
  const headRef    = useRef(null);
  const descRef    = useRef(null);

  useEffect(() => {
    let obs;

    const ctx = gsap.context(() => {
      const path = pathRef.current;
      if (!path) return;

      // ── Measure arc length for dash animation ──
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      // ── ScrollTrigger: scrub the arc as user scrolls into section ──
      // A glowing comet dot rides the leading tip of the stroke as it draws.
      const tip = tipRef.current;
      const progress = { p: 0 };
      const arcAnim = gsap.timeline({ paused: true })
        .to(path, { strokeDashoffset: 0, ease: "none" }, 0)
        .to(progress, {
          p: 1,
          ease: "none",
          onUpdate: () => {
            if (!tip) return;
            const pt = path.getPointAtLength(progress.p * length);
            tip.setAttribute("cx", pt.x);
            tip.setAttribute("cy", pt.y);
            tip.style.opacity = progress.p > 0.01 && progress.p < 0.995 ? 1 : 0;
          },
        }, 0);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",   // arc starts drawing when section top crosses 85% of viewport
        end: "top 15%",     // fully drawn when section top is at 15%
        scrub: 1.5,
        animation: arcAnim,
      });

      // ── Observer + ScrollTo: snap-scroll to section on first entry ──
      let snapped = false;
      obs = Observer.create({
        type: "wheel,touch",
        onDown: () => {
          if (snapped) return;
          const rect = sectionRef.current?.getBoundingClientRect();
          if (!rect) return;
          if (rect.top > 0 && rect.top < window.innerHeight * 0.6) {
            snapped = true;
            const smoother = ScrollSmoother.get();
            if (smoother) {
              smoother.scrollTo(sectionRef.current, true);
            } else {
              gsap.to(window, {
                scrollTo: { y: sectionRef.current },
                duration: 0.9,
                ease: "power2.inOut",
              });
            }
          }
        },
        onUp: () => { snapped = false; },
      });

      // ── Headline: each line rises out of its own mask ──
      if (headRef.current) {
        gsap.from(headRef.current.querySelectorAll(".kks-about-hl-inner"), {
          yPercent: 110,
          stagger: 0.14,
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        });
      }

      // ── Eyebrow, facts and sticker fade up ──
      gsap.from(".kks-about-eyebrow, .kks-about-fact, .kks-about-sticker", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
      });

      // ── Statement: words light up one by one as you scroll (scrubbed) ──
      if (descRef.current) {
        gsap.fromTo(descRef.current.querySelectorAll(".kks-about-word"),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: descRef.current,
              start: "top 85%",
              end: "bottom 55%",
              scrub: 1,
            },
          }
        );
      }

      // ── Sticker spins with scroll (controlled parallax) ──
      gsap.to(".kks-about-sticker-ring", {
        rotation: 200,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      // ── Full-width expansion on scroll ──
      // Expands the inset card to a full-bleed section as it reaches the top
      gsap.to(sectionRef.current, {
        width: "100%",
        borderTopLeftRadius: "0rem",
        borderTopRightRadius: "0rem",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 40%",
          end: "top top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      obs?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="kks-about-section" id="about" data-header="light">

      {/* Navier-Stokes fluid simulation background */}
      <LiquidEther
        colors={["#DCE4FF","#E9EEFF","#F2F1EC"]}
        mouseForce={20}
        cursorSize={55}
        isViscous
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        color0="#DCE4FF"
        color1="#E9EEFF"
        color2="#F2F1EC"
      />

      {/* Fine paper grid over the fluid */}
      <div className="kks-about-grid" aria-hidden="true" />

      <span className="kks-crop kks-crop--tr kks-about-crop" />
      <span className="kks-crop kks-crop--br kks-about-crop" />

      {/* Decorative arc — scroll-linked broad stroke from left */}
      <svg
        className="kks-about-arc"
        viewBox="0 0 460 900"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMinYMid meet"
      >
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#1D3BE8" />
            <stop offset="35%"  stopColor="#2B4BFF" />
            <stop offset="65%"  stopColor="#5B78FF" />
            <stop offset="100%" stopColor="#9DB0FF" />
          </linearGradient>
          <filter id="arcGlow" x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="arcTip">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#9DB0FF" />
            <stop offset="100%" stopColor="#2B4BFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Thin guide ring — always visible, like a construction line */}
        <path
          d="M 0 40 A 410 410 0 0 1 0 860"
          fill="none"
          stroke="#0a0a0a"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        {/* Background glow pass — always visible as a hint */}
        <path
          d="M 0 0 A 450 450 0 0 1 0 900"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.12"
          filter="url(#arcGlow)"
        />
        {/* Main crisp arc — scroll-drawn */}
        <path
          ref={pathRef}
          d="M 0 0 A 450 450 0 0 1 0 900"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Comet dot at the drawing tip */}
        <circle ref={tipRef} cx="0" cy="0" r="22" fill="url(#arcTip)" style={{ opacity: 0 }} />
        {/* Degree ticks along the outer edge */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-90 + i * 22.5) * (Math.PI / 180);
          const r1 = 470, r2 = 486;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1} y1={450 + Math.sin(a) * r1}
              x2={Math.cos(a) * r2} y2={450 + Math.sin(a) * r2}
              stroke="#0a0a0a" strokeOpacity="0.3" strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Content */}
      <div className="kks-about-content">
        <span className="kks-eyebrow kks-about-eyebrow">(01) — About</span>

        <div ref={headRef} className="kks-about-headline">
          <div className="kks-about-hl-line"><span className="kks-about-hl-inner">The person</span></div>
          <div className="kks-about-hl-line">
            <span className="kks-about-hl-inner">behind the <em>pixels</em>.</span>
          </div>
        </div>

        <div className="kks-about-lower">
          <p ref={descRef} className="kks-about-desc">
            {STATEMENT.split(" ").map((w, i) => (
              <span key={i} className="kks-about-word">{w} </span>
            ))}
          </p>

          <ul className="kks-about-facts">
            {FACTS.map((f) => (
              <li key={f.k} className="kks-about-fact">
                <span className="kks-about-fact-k">{f.k}</span>
                <span className="kks-about-fact-v">{f.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Spinning sticker */}
      <div className="kks-about-sticker" aria-hidden="true">
        <svg className="kks-about-sticker-ring" viewBox="0 0 200 200">
          <defs>
            <path id="kksAboutCircle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
          </defs>
          <text>
            <textPath href="#kksAboutCircle">Design ✦ Code ✦ Motion ✦ Design ✦ Code ✦ Motion ✦ </textPath>
          </text>
        </svg>
        <span className="kks-about-sticker-core">✦</span>
      </div>
    </section>
  );
}

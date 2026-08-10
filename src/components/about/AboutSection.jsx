"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer } from "gsap/all";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer);

const LiquidEther = dynamic(() => import("./LiquidEther"), { ssr: false });

export default function AboutSection() {
  const sectionRef = useRef(null);
  const pathRef    = useRef(null);
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
      const arcAnim = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        paused: true,
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",   // arc starts drawing when section top crosses 85% of viewport
        end: "top 15%",     // fully drawn when section top is at 15%
        scrub: 1.5,
        animation: arcAnim,
      });

      // ── Observer + ScrollTo: snap-scroll to section on first entry ──
      // When user scrolls down and section top is within 60% of viewport,
      // use ScrollTo to lock them into the section start so the arc draws cleanly.
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

      // ── Headline stagger reveal ──
      if (headRef.current) {
        const lines = headRef.current.querySelectorAll(".kks-about-hl-line");
        gsap.from(lines, {
          y: 90, opacity: 0, stagger: 0.18, duration: 1.4, ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        });
      }

      // ── Description fade-up ──
      if (descRef.current) {
        gsap.from(descRef.current, {
          y: 28, opacity: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: descRef.current, start: "top 88%" },
        });
      }

      // ── Full-width expansion on scroll ──
      // Expands the inset card to a full-bleed section as it reaches the top
      gsap.to(sectionRef.current, {
        width: "100%",
        borderTopLeftRadius: "0rem",
        borderTopRightRadius: "0rem",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 40%", // Start expanding when the card is in the upper half of the viewport
          end: "top top",   // Fully expanded when it hits the top edge
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
    <section ref={sectionRef} className="kks-about-section" id="about">

      {/* Navier-Stokes fluid simulation background */}
      <LiquidEther
        colors={["#E8F2FA","#EEF6FC","#F4F8FD"]}
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
        color0="#E8F2FA"
        color1="#EEF6FC"
        color2="#F4F8FD"
      />

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
            <stop offset="0%"   stopColor="#1D4ED8" />
            <stop offset="35%"  stopColor="#3B82F6" />
            <stop offset="65%"  stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <filter id="arcGlow" x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background glow pass — always visible as a hint */}
        <path
          d="M 0 0 A 450 450 0 0 1 0 900"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.15"
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
      </svg>

      {/* Content */}
      <div className="kks-about-content">
        <div ref={headRef} className="kks-about-headline">
          <div className="kks-about-hl-line">Bold Ideas,</div>
          <div className="kks-about-hl-line">Brought to Life</div>
        </div>

        <p ref={descRef} className="kks-about-desc">
          I design, build, and ship digital experiences that combine
          cinematic motion, immersive interactions, and technical
          precision. From concept to deployment&nbsp;— every pixel
          intentional, every interaction&nbsp;purposeful.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./story-reveal.css";

export default function StoryReveal() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline that pins the section and expands the image mask
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top", // Pin when section hits the top
          end: "+=150%",    // Keep pinned for 150% of the viewport height (creates scroll length)
          scrub: 1.0,       // Smooth scrubbing
          pin: true,
          anticipatePin: 1, // Prevent jitter on pin entry
        },
      });

      // Animate the clip-path to open up completely (0% inset on all sides)
      // Since z-index of image is higher than text, it will physically cover the text!
      tl.to(".kks-story-image-wrapper", {
        clipPath: "inset(0%)",
        ease: "none", // Linear ease is best for scroll-linked animations
      }, 0);

      // Subtly scale the image down to 1.0 as the mask opens for a parallax zoom effect
      tl.to(".kks-story-image", {
        scale: 1,
        ease: "none",
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="kks-story-section" data-no-fade data-header="light">
      <div className="kks-story-container">

        {/* Decorative Text */}
        <div className="kks-story-label-top">Est. 2023 — Craft Index</div>
        <div className="kks-story-label-bottom">Keep scrolling</div>

        <div className="kks-story-title-left">Designed</div>
        <div className="kks-story-title-right"><em>&amp;</em> Engineered</div>

        {/* The panel that expands to full-screen */}
        <div className="kks-story-image-wrapper" data-header="dark">
          <div className="kks-story-image kks-story-art" aria-hidden="true">
            <span className="kks-story-blob kks-story-blob--a" />
            <span className="kks-story-blob kks-story-blob--b" />
            <span className="kks-story-blob kks-story-blob--c" />
            <div className="kks-story-grid" />
            <div className="kks-story-statement">
              <span className="kks-story-mono">// where taste meets code</span>
              <span className="kks-story-big">Craft <em>×</em> Code</span>
              <span className="kks-story-mono kks-story-mono--right">60fps · a11y · pixel-true</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

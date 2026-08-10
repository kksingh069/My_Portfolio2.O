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
    <section ref={sectionRef} className="kks-story-section">
      <div className="kks-story-container">
        
        {/* Decorative Text */}
        <div className="kks-story-label-top">EST. 1990</div>
        <div className="kks-story-label-bottom">MELBOURNE</div>
        
        <div className="kks-story-title-left">Bespoke</div>
        <div className="kks-story-title-right">Luxury</div>

        {/* The Image that will expand */}
        <div className="kks-story-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
            alt="Bespoke Luxury Interior" 
            className="kks-story-image"
          />
        </div>

      </div>
    </section>
  );
}

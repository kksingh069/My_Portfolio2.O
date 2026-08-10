"use client";
import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionReveal() {
  useLayoutEffect(() => {
    // useLayoutEffect runs before paint — set initial hidden state immediately
    // so there is zero flash before GSAP takes over.
    const sections = gsap.utils.toArray("main section");

    const ctx = gsap.context(() => {
      sections.forEach((el, i) => {


        // ── Fade-away: section fades out as its bottom leaves the viewport ──
        // Only apply standard fade if it doesn't have the custom parallax exit
        if (!el.hasAttribute("data-parallax-exit")) {
          gsap.to(el, {
            autoAlpha: 0,
            ease: "power1.in",
            scrollTrigger: {
              trigger: el,
              start: "bottom 18%",
              end: "bottom -8%",
              scrub: 1.8,
            },
          });
        }
      });

      // ── Reusable Overlapping Parallax Exit Transition ──
      // Any section with data-parallax-exit="true" will pin in place while the next section 
      // scrolls over it. No fading or scaling, just a clean overlap.
      const parallaxExits = gsap.utils.toArray("[data-parallax-exit='true']");
      parallaxExits.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top top",     // Pin exactly when it hits the top of the viewport
          end: "bottom top",    // Unpin after scrolling the height of the section
          pin: true,
          pinSpacing: false,    // Allows the NEXT section to naturally scroll over this one!
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}

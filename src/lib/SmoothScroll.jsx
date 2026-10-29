"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer);

/**
 * Smooth, "soothing" inertial scroll.
 *  smooth 1.35   — glides ~1.35s to catch up: calm, but never laggy
 *  ease expo.out — long, soft deceleration at the end of every flick
 *  speed 0.95    — each wheel tick travels slightly less → gentler pace
 */
export default function SmoothScroll() {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.35,
      ease: "expo.out",
      speed: 0.95,
      effects: true,
      smoothTouch: 0.12,
    });
    return () => smoother.kill();
  }, []);
  return null;
}

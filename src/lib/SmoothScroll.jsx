"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer);

export default function SmoothScroll() {
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
    });
    return () => smoother.kill();
  }, []);
  return null;
}

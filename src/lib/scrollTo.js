"use client";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/** Smoothly scroll to a selector / element / number, using ScrollSmoother when present. */
export function scrollToTarget(target) {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, true, "top top");
    return;
  }
  gsap.to(window, { scrollTo: { y: target }, duration: 1.2, ease: "power3.inOut" });
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Magnetic — the wrapped element leans toward the cursor while hovered,
 * then springs back with an elastic release.
 * strength: how far it follows (0.2 subtle → 0.6 strong)
 */
export default function Magnetic({ children, strength = 0.35, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={`kks-magnetic ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

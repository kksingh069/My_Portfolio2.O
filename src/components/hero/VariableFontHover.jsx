"use client";
import { useRef, useCallback } from "react";

export default function VariableFontHover({
  text,
  className = "",
  baseWeight = 800,
  minWeight = 100,
  maxWeight = 900,
}) {
  const containerRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    const letters = containerRef.current?.querySelectorAll("[data-letter]");
    if (!letters) return;

    letters.forEach((el) => {
      // stagger each letter with a slight random delay so they fire independently
      const delay = Math.random() * 120;
      const id = setTimeout(() => {
        const w = Math.round(minWeight + Math.random() * (maxWeight - minWeight));
        el.style.fontVariationSettings = `'wght' ${w}`;
      }, delay);
      timersRef.current.push(id);
    });
  }, [minWeight, maxWeight]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    const letters = containerRef.current?.querySelectorAll("[data-letter]");
    if (!letters) return;

    letters.forEach((el, i) => {
      const delay = i * 18;
      const id = setTimeout(() => {
        el.style.fontVariationSettings = `'wght' ${baseWeight}`;
      }, delay);
      timersRef.current.push(id);
    });
  }, [baseWeight]);

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-block", cursor: "none" }}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          data-letter
          style={{
            display: "inline-block",
            fontVariationSettings: `'wght' ${baseWeight}`,
            transition: "font-variation-settings 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

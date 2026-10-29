"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./fx.css";

gsap.registerPlugin(ScrollTrigger);

// Section ids → label shown in the HUD
const SECTIONS = [
  ["about", "01 / About"],
  ["capabilities", "02 / Capabilities"],
  ["work", "03 / Work"],
  ["principles", "04 / Principles"],
  ["process", "05 / Process"],
  ["contact", "07 / Contact"],
];

/** Fixed bottom-left HUD: live scroll percentage + a progress hairline. */
export default function ScrollHUD() {
  const pctRef = useRef(null);
  const fillRef = useRef(null);
  const [label, setLabel] = useState("00 / Intro");

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const p = self.progress;
        if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      },
    });
    // Current-section label (re-created once the preloader has laid out the pins)
    let sts = [];
    const build = () => {
      sts.forEach((t) => t.kill());
      sts = SECTIONS.map(([id, text], i) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el.closest(".pin-spacer") || el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setLabel(text);
            else if (!self.isActive && self.direction < 0 && i === 0) setLabel("00 / Intro");
          },
        });
      }).filter(Boolean);
    };
    const t = setTimeout(build, 300);
    window.addEventListener("kks:loaded", build);

    return () => {
      st.kill();
      clearTimeout(t);
      window.removeEventListener("kks:loaded", build);
      sts.forEach((x) => x.kill());
    };
  }, []);

  return (
    <div className="kks-hud" aria-hidden="true">
      <div className="kks-hud-track"><div ref={fillRef} className="kks-hud-fill" /></div>
      <div className="kks-hud-label">
        <span className="kks-hud-section" key={label}>{label}</span>
        <span ref={pctRef}>000</span>
      </div>
    </div>
  );
}

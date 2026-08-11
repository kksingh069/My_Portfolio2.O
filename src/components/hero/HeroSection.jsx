"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import BlurText from "./BlurText";

const Aurora = dynamic(() => import("./Aurora"), { ssr: false });

const FLIP_DUR = 0.45;
const FLIP_EASE = [0.215, 0.61, 0.355, 1.0];

function FlipLetter({ char }) {
  return (
    <motion.span
      className="kks-flip-char relative inline-block overflow-hidden whitespace-nowrap"
      initial="initial"
      whileHover="hovered"
    >
      <span className="block">
        <motion.span
          className="inline-block"
          variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </span>
      <span className="absolute inset-0 block">
        <motion.span
          className="inline-block"
          variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </span>
    </motion.span>
  );
}

export default function HeroSection() {
  return (
    <section className="kks-hero-section" data-parallax-exit="true">

      <Aurora
        colorStops={["#ffffff", "#f3f4f6", "#e5e7eb"]}
        amplitude={1.0}
        blend={0.5}
        speed={0.5}
      />

      <div className="kks-hero-overlay">
        <div className="kks-hero-title-wrap">

          <div className="kks-hero-headline">
            <BlurText
              text="VISIONARY"
              animateBy="letters"
              direction="bottom"
              delay={60}
              stepDuration={0.45}
              className="kks-hl-line"
              renderSegment={(char) => <FlipLetter char={char} />}
            />
          </div>

          <motion.div
            className="kks-hl-rule"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

        </div>
      </div>
    </section>
  );
}

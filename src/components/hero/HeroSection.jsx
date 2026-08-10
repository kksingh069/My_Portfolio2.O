"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Aurora = dynamic(() => import("./Aurora"), { ssr: false });

// ── Entrance animation (word-level slide-up from mask) ───────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.5 },
  },
};

const wordVariants = {
  hidden: { y: "108%", skewY: 1.5 },
  visible: {
    y: "0%",
    skewY: 0,
    transition: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
  },
};

// Flip timing — smooth, cinematic timing curves
const FLIP_DUR = 0.45;
const FLIP_EASE = [0.215, 0.61, 0.355, 1.0]; // cubic-bezier matching custom easeOutCubic

function FlipLetter({ char, topColor = "#fff", bottomColor = "#fff", isAccent = false }) {
  // If character is space, render it normally to preserve gaps in kks-hl-line
  if (char === " ") {
    return <span className="inline-block">&nbsp;</span>;
  }

  return (
    <motion.span
      className={`kks-flip-char relative inline-block overflow-hidden whitespace-nowrap ${isAccent ? " kks-flip-char--accent" : ""}`}
      initial="initial"
      whileHover="hovered"
    >
      <div>
        <motion.span
          className="inline-block"
          style={{ color: topColor }}
          variants={{
            initial: { y: 0 },
            hovered: { y: "-100%" },
          }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </div>
      <div className="absolute inset-0">
        <motion.span
          className="inline-block"
          style={{ color: bottomColor }}
          variants={{
            initial: { y: "100%" },
            hovered: { y: 0 },
          }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </div>
    </motion.span>
  );
}

// ── Splits word into individual FlipLetters ──────────────────────
function LetterSplit({ text, topColor = "#fff", bottomColor = "#fff", accentAt = null }) {
  return (
    <span aria-label={text} style={{ display: "inline" }}>
      {text.split("").map((char, i) => {
        const isAccent = accentAt && i === accentAt.index;
        return (
          <FlipLetter
            key={i}
            char={char}
            topColor={isAccent ? accentAt.color : topColor}
            bottomColor={bottomColor}
            isAccent={isAccent}
          />
        );
      })}
    </span>
  );
}

// ── Word — overflow:hidden entrance mask around LetterSplit ──────
function Word({ children, topColor = "#fff", bottomColor = "#fff", accentAt = null }) {
  return (
    <span className="kks-word-mask">
      <motion.span className="kks-word-inner" variants={wordVariants}>
        <LetterSplit
          text={children}
          topColor={topColor}
          bottomColor={bottomColor}
          accentAt={accentAt}
        />
      </motion.span>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
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

        {/* ── Headline ─────────────────────────────────────── */}
        <div className="kks-hero-title-wrap">
          <motion.div
            className="kks-hero-headline"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="kks-hl-line">
              <Word topColor="#000000" bottomColor="#000000">I</Word>
              <Word topColor="#000000" bottomColor="#000000">BUILD</Word>
              <Word topColor="#000000" bottomColor="#000000" accentAt={{ index: 1, color: "#000000" }}>MODERN</Word>
            </div>

            <div className="kks-hl-line">
              <Word topColor="#000000" bottomColor="#000000">WEBSITES</Word>
            </div>

            <div className="kks-hl-line">
              <Word topColor="#000000" bottomColor="#000000">THAT</Word>
              <Word topColor="#000000" bottomColor="#000000">WORK</Word>
            </div>
          </motion.div>

          <motion.div
            className="kks-hl-rule"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

      </div>
    </section>
  );
}

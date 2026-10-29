"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SITE } from "@/lib/content";
import Magnetic from "@/components/fx/Magnetic";
import { scrollToTarget } from "@/lib/scrollTo";
import HeroPortrait from "./HeroPortrait";

const FLIP_DUR = 0.45;
const FLIP_EASE = [0.215, 0.61, 0.355, 1.0];
const EXPO = [0.16, 1, 0.3, 1];

/** Letter that rolls to a second copy on hover. */
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
          variants={{ initial: { y: 0 }, hovered: { y: "-130%" } }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </span>
      <span className="absolute inset-0 block">
        <motion.span
          className="inline-block"
          variants={{ initial: { y: "135%" }, hovered: { y: 0 } }}
          transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
        >
          {char}
        </motion.span>
      </span>
    </motion.span>
  );
}

/** A headline line: letters rise out of a mask one after another. */
function RiseLine({ text, ready, delay = 0, className = "" }) {
  return (
    <span className={`kks-hn-line ${className}`} aria-label={text}>
      {text.split("").map((c, i) =>
        c === " " ? (
          <span key={i} className="kks-hn-space" />
        ) : (
          <span key={i} className="kks-hn-mask" aria-hidden="true">
            <motion.span
              className="kks-hn-char"
              initial={{ y: "110%", rotate: 6 }}
              animate={ready ? { y: "0%", rotate: 0 } : {}}
              transition={{ delay: delay + i * 0.04, duration: 1.1, ease: EXPO }}
            >
              <FlipLetter char={c} />
            </motion.span>
          </span>
        )
      )}
    </span>
  );
}

/** Waits for the preloader curtain before running the intro. */
function useSiteReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.__kksLoaded) { setReady(true); return; }
    const on = () => setReady(true);
    window.addEventListener("kks:loaded", on);
    const fallback = setTimeout(on, 4500); // never leave the hero empty
    return () => { window.removeEventListener("kks:loaded", on); clearTimeout(fallback); };
  }, []);
  return ready;
}

const fadeUp = (ready, delay) => ({
  initial: { y: 24, opacity: 0 },
  animate: ready ? { y: 0, opacity: 1 } : {},
  transition: { delay, duration: 1, ease: EXPO },
});

const ROLES = ["Creative Development", "Frontend Engineering", "Motion & WebGL", "UI / UX"];

export default function HeroSection() {
  const ready = useSiteReady();
  const [first, ...rest] = SITE.name.split(" ");

  return (
    <section className="kks-hero-section" data-parallax-exit="true" data-header="light">
      <div className="kks-hero-bg" aria-hidden="true" />

      <span className="kks-crop kks-crop--bl kks-hero-crop" />
      <span className="kks-crop kks-crop--br kks-hero-crop" />

      {/* Meta row */}
      <div className="kks-hero-meta">
        <motion.div className="kks-hero-meta-col" {...fadeUp(ready, 0.2)}>
          <span className="kks-hero-meta-k">Index</span>
          <span>Portfolio ’26</span>
        </motion.div>
        <motion.div className="kks-hero-meta-col" {...fadeUp(ready, 0.3)}>
          <span className="kks-hero-meta-k">Based in</span>
          <span>{SITE.location} · UTC+5:30</span>
        </motion.div>
        <motion.div className="kks-hero-meta-col" {...fadeUp(ready, 0.4)}>
          <span className="kks-hero-meta-k">Status</span>
          <span className="kks-hero-status"><i />Open to collaborations</span>
        </motion.div>
      </div>

      <div className="kks-hero-grid">
        {/* ── Left: who he is ── */}
        <div className="kks-hero-copy">
          <motion.p className="kks-hero-kicker" {...fadeUp(ready, 0.1)}>
            <span>(00)</span> — Hello, I’m
          </motion.p>

          <h1 className="kks-hero-name">
            <RiseLine text={first} ready={ready} delay={0.15} />
            <RiseLine text={rest.join(" ")} ready={ready} delay={0.4} className="kks-hn-line--2" />
          </h1>

          <motion.p className="kks-hero-lede" {...fadeUp(ready, 0.95)}>
            A <em>creative developer</em> who designs and engineers immersive web
            experiences — motion, 3D and interfaces that feel as good as they look.
            I sit where taste meets code, so bold ideas ship as fast, memorable products.
          </motion.p>

          <motion.ul className="kks-hero-roles" {...fadeUp(ready, 1.08)}>
            {ROLES.map((r) => <li key={r}>{r}</li>)}
          </motion.ul>

          <motion.div className="kks-hero-ctas" {...fadeUp(ready, 1.2)}>
            <Magnetic strength={0.3}>
              <button type="button" className="kks-hero-btn kks-hero-btn--solid" data-cursor="Explore" onClick={() => scrollToTarget("#work")}>
                <span className="kks-hero-btn-label"><span>See my work</span></span>
                <span className="kks-hero-btn-orb" aria-hidden="true">↘</span>
              </button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button type="button" className="kks-hero-btn kks-hero-btn--ghost" data-cursor="Say hi" onClick={() => scrollToTarget("#contact")}>
                <span className="kks-hero-btn-label"><span>Let’s talk</span></span>
              </button>
            </Magnetic>
          </motion.div>

          <motion.a
            href="#about"
            className="kks-hero-scroll"
            data-cursor="Scroll"
            onClick={(e) => { e.preventDefault(); scrollToTarget("#about"); }}
            {...fadeUp(ready, 1.35)}
          >
            <span className="kks-hero-scroll-line" />
            Scroll to explore
          </motion.a>
        </div>

        {/* ── Right: the 3D self that follows your cursor ── */}
        <div className="kks-hero-visual">
          <HeroPortrait ready={ready} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useMenu } from "./MenuContext";
import { scrollToTarget } from "@/lib/scrollTo";
import { SITE } from "@/lib/content";

const menuItems = [
  { id: "about",   target: "#about",   number: "01", label: "ABOUT",   marqueeText: "MY JOURNEY",     color: "#6b8f71", reverse: false },
  { id: "work",    target: "#work",    number: "02", label: "WORK",    marqueeText: "SELECTED WORKS", color: "#b07d4f", reverse: true },
  { id: "process", target: "#process", number: "03", label: "PROCESS", marqueeText: "HOW I BUILD",    color: "#2b4bff", reverse: false },
  { id: "contact", target: "#contact", number: "04", label: "CONTACT", marqueeText: "LET'S CONNECT",  color: "#5a7a9e", reverse: true },
];

// Smooth easing — decelerates gently, no hard stop
const EASE = [0.25, 0.46, 0.45, 0.94];

function MarqueeTrack({ text, reverse }) {
  return (
    <div className={`kks-marquee-track${reverse ? " kks-marquee-reverse" : ""}`}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="kks-marquee-segment">
          {text}
          <span className="kks-marquee-dot">
            <ArrowUpRight weight="bold" size={14} />
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Menu() {
  const { isMenuOpen, closeMenu } = useMenu();
  const [hoveredItem, setHoveredItem] = useState(null);
  const overlayRef = useRef(null);
  const closeRef = useRef(closeMenu);
  useEffect(() => { closeRef.current = closeMenu; });

  // While the menu is open: freeze the page behind it (so the wheel scrolls
  // the menu, not the site) and let Esc close it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    document.documentElement.classList.add("kks-menu-open");
    requestAnimationFrame(() => { if (overlayRef.current) overlayRef.current.scrollTop = 0; });
    const onKey = (e) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => {
      smoother?.paused(false);
      document.documentElement.classList.remove("kks-menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          {/* Close button */}
          <motion.button
            className="kks-menu-close"
            onClick={closeMenu}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ delay: 0.35, duration: 0.35, ease: EASE }}
            data-cursor-hover
            aria-label="Close menu"
          >
            <X weight="bold" size={20} />
          </motion.button>

          {/* Fullscreen overlay — slides up from bottom */}
          <motion.div
            ref={overlayRef}
            className="kks-menu-overlay"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.64, 0, 0.78, 0] } }}
          >
            <nav className="kks-menu-content">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="kks-menu-item"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    closeMenu();
                    // let the overlay start leaving, then glide to the section
                    setTimeout(() => scrollToTarget(item.target), 450);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      closeMenu();
                      setTimeout(() => scrollToTarget(item.target), 450);
                    }
                  }}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  data-cursor-hover
                >
                  {/*
                   * Marquee strip — scaleY from top center.
                   * Stays inside parent bounds at all times (no y overflow),
                   * which eliminates the repaint flicker from y: "-100%" approach.
                   */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="kks-marquee-strip"
                        style={{ backgroundColor: item.color, transformOrigin: "top center" }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.48, ease: EASE }}
                      >
                        <MarqueeTrack text={item.marqueeText} reverse={item.reverse} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Label — fades and drifts up as marquee reveals beneath it */}
                  <motion.div
                    className="kks-menu-label"
                    animate={{
                      opacity: hoveredItem === item.id ? 0 : 1,
                      y: hoveredItem === item.id ? -7 : 0,
                    }}
                    transition={{ duration: 0.38, ease: EASE }}
                  >
                    <span className="kks-menu-number">{item.number}</span>
                    <span className="kks-menu-text">{item.label}</span>
                  </motion.div>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <motion.div
              className="kks-menu-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span>
                My work is driven by clarity,<br />
                performance, and attention to detail.
              </span>
              <span style={{ textAlign: "center" }}>
                © {new Date().getFullYear()} {SITE.name}<br />
                All Rights Reserved
              </span>
              <span style={{ textAlign: "right" }}>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a><br />
                India &mdash; Open to Collaborations
              </span>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

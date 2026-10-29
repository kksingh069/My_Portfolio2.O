"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ArrowUp, Copy, Check } from "@phosphor-icons/react";
import Magnetic from "@/components/fx/Magnetic";
import { SITE, SOCIALS, NAV } from "@/lib/content";
import { scrollToTarget } from "@/lib/scrollTo";
import Starfield from "./Starfield";
import "./footer.css";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["iconic", "timeless", "bold", "yours"];

function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: SITE.timezone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time || "--:--:--"}</span>;
}

/** Word that flips through WORDS — width locked to the longest word */
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="kks-ft-rot" aria-label={WORDS[0]}>
      {WORDS.map((w, n) => {
        const state = n === i ? "is-in" : n === (i - 1 + WORDS.length) % WORDS.length ? "is-out" : "";
        return (
          <em key={w} className={`kks-ft-rot-word ${state}`} aria-hidden="true">{w}</em>
        );
      })}
    </span>
  );
}

/** Circular rotating text badge */
function Badge() {
  const text = `Open to collaborations • Building bold ideas • `;
  return (
    <div className="kks-ft-badge" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="kksBadgeCircle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href="#kksBadgeCircle" startOffset="0">{text.repeat(2)}</textPath>
        </text>
      </svg>
      <span className="kks-ft-badge-dot" />
    </div>
  );
}

export default function Footer() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Domed top edge flattens as the footer scrolls in
      gsap.fromTo(".kks-ft-dome", { scaleY: 1 }, {
        scaleY: 0,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "top 35%", scrub: true },
      });

      // Headline lines rise, staggered
      gsap.from(".kks-ft-hl-inner", {
        yPercent: 115,
        duration: 1.4,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
      });

      gsap.from(".kks-ft-hint, .kks-ft-cta-row > *", {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".kks-ft-cta-row", start: "top 92%", once: true },
      });

      // Columns stagger in
      gsap.from(".kks-ft-col", {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".kks-ft-cols", start: "top 92%", once: true },
      });

    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={rootRef} className="kks-footer" id="contact" data-header="dark">
      <div className="kks-ft-dome" aria-hidden="true" />

      <div ref={stageRef} className="kks-ft-clip">
        <Starfield />
        <div className="kks-ft-glow" aria-hidden="true" />

        <div className="kks-ft-inner">
          <div className="kks-ft-top">
            <span className="kks-eyebrow">(07) — Contact</span>
            <Badge />
          </div>

          <h2 className="kks-ft-headline">
            <span className="kks-ft-hl-clip"><span className="kks-ft-hl-inner">Let’s build</span></span>
            <span className="kks-ft-hl-clip">
              <span className="kks-ft-hl-inner">something <RotatingWord />.</span>
            </span>
          </h2>

          <p className="kks-ft-hint">
            <span className="kks-ft-hint-dot" />
            Move through the sky — draw your own constellation.
          </p>

          <div className="kks-ft-cta-row">
            <Magnetic strength={0.3} className="kks-ft-cta-wrap">
              <a href={`mailto:${SITE.email}`} className="kks-ft-cta">
                <span className="kks-ft-cta-fill" />
                <span className="kks-ft-cta-label">
                  <span className="kks-ft-cta-line"><em>Talk to</em> {SITE.initials}</span>
                  <span className="kks-ft-cta-line" aria-hidden="true"><em>Talk to</em> {SITE.initials}</span>
                </span>
                <span className="kks-ft-cta-orb">
                  <ArrowUpRight size={18} weight="bold" className="kks-ft-cta-arrow" />
                  <ArrowUpRight size={18} weight="bold" className="kks-ft-cta-arrow kks-ft-cta-arrow--next" />
                </span>
              </a>
            </Magnetic>

            <button type="button" className="kks-ft-email" onClick={copyEmail}>
              <span className="kks-ft-email-text">{SITE.email}</span>
              <span className="kks-ft-email-icon">{copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}</span>
              <span className={`kks-ft-email-tip${copied ? " is-on" : ""}`}>{copied ? "Copied!" : "Click to copy"}</span>
            </button>
          </div>

          <div className="kks-ft-cols" data-trail-off>
            <div className="kks-ft-col">
              <span className="kks-ft-col-label">Socials</span>
              <ul>
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="kks-ft-link" data-cursor="Open">
                      <span className="kks-ft-link-roll"><span data-text={s.label}>{s.label}</span></span>
                      <ArrowUpRight size={12} weight="bold" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="kks-ft-col">
              <span className="kks-ft-col-label">Navigate</span>
              <ul>
                {NAV.map((n) => (
                  <li key={n.label}>
                    <button type="button" className="kks-ft-link" onClick={() => scrollToTarget(n.target)}>
                      <span className="kks-ft-link-roll"><span data-text={n.label}>{n.label}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="kks-ft-col">
              <span className="kks-ft-col-label">Local time</span>
              <p className="kks-ft-time"><LocalTime /> <small>IST · UTC+5:30</small></p>
              <p className="kks-ft-note">Based in {SITE.location}.<br />Working with teams worldwide.</p>
            </div>

            <div className="kks-ft-col kks-ft-col--end">
              <Magnetic strength={0.3}>
                <button type="button" className="kks-ft-top-btn" onClick={() => scrollToTarget(0)} data-cursor="Top" aria-label="Back to top">
                  <ArrowUp size={20} weight="bold" />
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Easter-egg hint — last line inside the footer content */}
          <span className="kks-ft-egg" data-trail-off>
            Psst — press <kbd>G</kbd>
          </span>
        </div>
      </div>
    </footer>
  );
}

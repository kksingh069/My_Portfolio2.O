"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROCESS } from "@/lib/content";
import "./process.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Process — vertical scroll drives a horizontal track (pinned).
 * Each step's content staggers in as its panel crosses the viewport.
 * On tablet/mobile it falls back to a simple vertical stack.
 */
export default function ProcessSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
      const track = trackRef.current;
      const distance = () => track.scrollWidth - window.innerWidth;

      const scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(".kks-process-progress-fill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: true,
        },
      });

      gsap.utils.toArray(".kks-process-panel").forEach((panel) => {
        const items = panel.querySelectorAll(".kks-pp-stagger");
        gsap.from(items, {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left 75%",
            toggleActions: "play none none reverse",
          },
        });
        // Big number drifts against the scroll — controlled parallax
        gsap.fromTo(panel.querySelector(".kks-pp-no"), { xPercent: 30 }, {
          xPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        });
      });
    });

    mm.add("(max-width: 900px)", () => {
      gsap.utils.toArray(".kks-process-panel").forEach((panel) => {
        gsap.from(panel.querySelectorAll(".kks-pp-stagger"), {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 80%", once: true },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="kks-process-section" id="process" data-no-fade data-header="light">
      <div className="kks-process-progress"><div className="kks-process-progress-fill" /></div>

      <div ref={trackRef} className="kks-process-track">
        <div className="kks-process-intro">
          <span className="kks-eyebrow">(05) — Process</span>
          <h2 className="kks-process-title">
            How an idea<br />becomes a <em>product</em>.
          </h2>
          <p className="kks-process-hint">
            <span className="kks-process-arrow" aria-hidden="true">→</span>
            Four steps. Keep scrolling.
          </p>
        </div>

        {PROCESS.map((step) => (
          <article key={step.no} className="kks-process-panel">
            <div className="kks-pp-no" aria-hidden="true">{step.no}</div>
            <div className="kks-pp-body">
              <span className="kks-pp-tag kks-pp-stagger">Step {step.no} / {String(PROCESS.length).padStart(2, "0")}</span>
              <h3 className="kks-pp-title kks-pp-stagger">{step.title}</h3>
              <p className="kks-pp-text kks-pp-stagger">{step.body}</p>
              <ul className="kks-pp-list">
                {step.deliverables.map((d) => (
                  <li key={d} className="kks-pp-stagger"><span>+</span>{d}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

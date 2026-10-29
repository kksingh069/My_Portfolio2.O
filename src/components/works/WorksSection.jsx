"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/lib/content";
import ProjectDrawer, { ProjectMedia } from "./ProjectDrawer";
import "./works.css";

gsap.registerPlugin(ScrollTrigger);

function WorkCard({ project, onOpen }) {
  const cardRef = useRef(null);

  // Subtle 3D tilt toward the cursor
  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;
    const media = card.querySelector(".kks-work-frame");
    const rx = gsap.quickTo(media, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(media, "rotationY", { duration: 0.8, ease: "power3.out" });

    const move = (e) => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 8);
      rx(-py * 8);
    };
    const leave = () => { rx(0); ry(0); };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);
    return () => {
      card.removeEventListener("mousemove", move);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <a
      ref={cardRef}
      href={`#${project.id}`}
      className="kks-work-card"
      data-cursor="Open"
      onClick={(e) => { e.preventDefault(); onOpen(project.id); }}
      aria-haspopup="dialog"
    >
      <div className="kks-work-frame">
        <div className="kks-work-reveal">
          <div className="kks-work-media">
            <ProjectMedia project={project} />
          </div>
        </div>
        <span className="kks-work-badge">{project.year}</span>
        <span className="kks-work-open" aria-hidden="true">View case study <i>+</i></span>
      </div>

      <div className="kks-work-info">
        <span className="kks-work-index">{project.index}</span>
        <div className="kks-work-titles">
          <h3 className="kks-work-title">{project.title}</h3>
          <p className="kks-work-kind">{project.kind}</p>
        </div>
        <ul className="kks-work-tags">
          {project.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </a>
  );
}

/**
 * Selected Work — two staggered columns moving at different speeds
 * (controlled parallax), each cover unmasked by a clip-path wipe while
 * the image inside counter-scrolls.
 */
export default function WorksSection() {
  const sectionRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const open = useCallback((id) => setActiveId(id), []);
  const close = useCallback(() => setActiveId(null), []);
  const left = PROJECTS.filter((_, i) => i % 2 === 0);
  const right = PROJECTS.filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      gsap.from(".kks-works-title-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });

      gsap.utils.toArray(".kks-work-card").forEach((card) => {
        const reveal = card.querySelector(".kks-work-reveal");
        const media = card.querySelector(".kks-work-media");
        const info = card.querySelectorAll(".kks-work-index, .kks-work-title, .kks-work-kind, .kks-work-tags li");

        // Mask wipe up
        gsap.fromTo(reveal,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 85%", once: true },
          }
        );
        gsap.fromTo(media, { scale: 1.35 }, {
          scale: 1.1, duration: 1.8, ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });

        // Inner counter-parallax while scrolling past
        gsap.fromTo(media, { yPercent: -6 }, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        });

        // Staggered meta
        gsap.from(info, {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 70%", once: true },
        });
      });
    }, sectionRef);

    // Columns at different speeds — desktop only, kept small so it's felt, not noticed
    mm.add("(min-width: 901px)", () => {
      gsap.to(".kks-works-col--right", {
        y: -160,
        ease: "none",
        scrollTrigger: { trigger: ".kks-works-grid", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".kks-works-col--left", {
        y: 60,
        ease: "none",
        scrollTrigger: { trigger: ".kks-works-grid", start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="kks-works-section" id="work" data-header="dark">
      <span className="kks-crop kks-crop--tl" />
      <span className="kks-crop kks-crop--tr" />

      <header className="kks-works-header">
        <span className="kks-eyebrow">(03) — Selected Work</span>
        <h2 className="kks-works-title">
          <span className="kks-works-title-clip"><span className="kks-works-title-inner">Selected</span></span>
          <span className="kks-works-title-clip">
            <span className="kks-works-title-inner"><em>work</em><sup>({String(PROJECTS.length).padStart(2, "0")})</sup></span>
          </span>
        </h2>
        <p className="kks-works-sub">
          A few things I’ve designed and built — from WebGL launches to design systems.
          Each one shipped to real users.
        </p>
      </header>

      <div className="kks-works-grid">
        <div className="kks-works-col kks-works-col--left">
          {left.map((p) => <WorkCard key={p.id} project={p} onOpen={open} />)}
        </div>
        <div className="kks-works-col kks-works-col--right">
          {right.map((p) => <WorkCard key={p.id} project={p} onOpen={open} />)}
        </div>
      </div>

      <ProjectDrawer projects={PROJECTS} activeId={activeId} onClose={close} onChange={setActiveId} />
    </section>
  );
}

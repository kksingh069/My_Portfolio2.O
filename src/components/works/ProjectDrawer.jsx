"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ArrowUpRight, ArrowRight, X, GithubLogo } from "@phosphor-icons/react";
import WorkCover from "./WorkCover";
import "./drawer.css";

const EASE = [0.16, 1, 0.3, 1];

/** Real image when the project has one, generated cover otherwise */
export function ProjectMedia({ project }) {
  if (project.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.image} alt="" className="kks-media-img" />;
  }
  return <WorkCover kind={project.cover} title={project.title} />;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};
const rise = {
  hidden: { y: 28, opacity: 0, filter: "blur(6px)" },
  show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

/**
 * ProjectDrawer — frosted-glass case-study panel that slides in from the right.
 * Opens over the page (portal to <body>, so the smooth-scroll transform
 * can't trap it), pauses page scrolling, closes on Esc / backdrop / ✕,
 * and lets you step to the next project without closing.
 */
export default function ProjectDrawer({ projects, activeId, onClose, onChange }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const project = projects.find((p) => p.id === activeId) || null;
  const idx = project ? projects.indexOf(project) : -1;
  const next = idx >= 0 ? projects[(idx + 1) % projects.length] : null;

  useEffect(() => setMounted(true), []);

  // Pause the page scroll + keyboard handling while open
  useEffect(() => {
    if (!project) return;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    document.documentElement.classList.add("kks-drawer-open");
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 300);
    return () => {
      smoother?.paused(false);
      document.documentElement.classList.remove("kks-drawer-open");
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [project, onClose]);

  // Back to the top of the panel when switching projects
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [activeId]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="kks-drawer-root" key="drawer">
          <motion.div
            className="kks-drawer-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
            transition={{ duration: 0.5 }}
          />

          <motion.aside
            className="kks-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} — project details`}
            initial={{ x: "105%", rotate: 2 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: "105%", rotate: 2, transition: { duration: 0.55, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <span className="kks-drawer-sheen" aria-hidden="true" />

            <header className="kks-drawer-bar">
              <span className="kks-drawer-crumb">
                <b>{project.index}</b> / {String(projects.length).padStart(2, "0")} — Case study
              </span>
              <button ref={closeRef} type="button" className="kks-drawer-close" onClick={onClose} aria-label="Close project" data-cursor="Close">
                <X size={18} weight="bold" />
              </button>
            </header>

            <div ref={panelRef} className="kks-drawer-scroll" data-lenis-prevent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.id}
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                >
                  <motion.div className="kks-drawer-media" variants={{
                    hidden: { clipPath: "inset(100% 0% 0% 0% round 14px)" },
                    show: { clipPath: "inset(0% 0% 0% 0% round 14px)", transition: { duration: 1.1, ease: EASE } },
                  }}>
                    <ProjectMedia project={project} />
                    <span className="kks-drawer-year">{project.year}</span>
                  </motion.div>

                  <motion.p className="kks-drawer-kind" variants={rise}>{project.kind}</motion.p>
                  <motion.h3 className="kks-drawer-title" variants={rise}>{project.title}</motion.h3>

                  <motion.dl className="kks-drawer-meta" variants={rise}>
                    <div><dt>Role</dt><dd>{project.role}</dd></div>
                    <div><dt>Timeline</dt><dd>{project.duration}</dd></div>
                    <div><dt>Year</dt><dd>{project.year}</dd></div>
                  </motion.dl>

                  <motion.p className="kks-drawer-summary" variants={rise}>{project.summary}</motion.p>

                  <motion.div className="kks-drawer-metrics" variants={rise}>
                    {project.metrics?.map((m) => (
                      <div key={m.label} className="kks-drawer-metric">
                        <span className="kks-drawer-metric-v">{m.value}<small>{m.unit}</small></span>
                        <span className="kks-drawer-metric-l">{m.label}</span>
                      </div>
                    ))}
                  </motion.div>

                  <motion.h4 className="kks-drawer-h" variants={rise}>Highlights</motion.h4>
                  <ul className="kks-drawer-list">
                    {project.highlights?.map((h, i) => (
                      <motion.li key={i} variants={rise}>
                        <span>{String(i + 1).padStart(2, "0")}</span>{h}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.h4 className="kks-drawer-h" variants={rise}>Stack</motion.h4>
                  <motion.ul className="kks-drawer-tags" variants={rise}>
                    {project.tags.map((t) => <li key={t}>{t}</li>)}
                  </motion.ul>

                  <motion.div className="kks-drawer-actions" variants={rise}>
                    {project.live ? (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="kks-drawer-btn kks-drawer-btn--solid">
                        Visit live site <ArrowUpRight size={16} weight="bold" />
                      </a>
                    ) : (
                      <span className="kks-drawer-btn kks-drawer-btn--ghost is-soon">Live link coming soon</span>
                    )}
                    {project.code && (
                      <a href={project.code} target="_blank" rel="noopener noreferrer" className="kks-drawer-btn kks-drawer-btn--ghost">
                        <GithubLogo size={16} weight="bold" /> Source
                      </a>
                    )}
                  </motion.div>

                  {next && next.id !== project.id && (
                    <motion.button
                      type="button"
                      className="kks-drawer-next"
                      variants={rise}
                      onClick={() => onChange(next.id)}
                      data-cursor="Next"
                    >
                      <span className="kks-drawer-next-k">Next project</span>
                      <span className="kks-drawer-next-t">{next.title}</span>
                      <span className="kks-drawer-next-orb"><ArrowRight size={18} weight="bold" /></span>
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./fx.css";

/**
 * Easter eggs — "a site with nothing to discover feels built to be used once".
 *  • Press  G           → toggles the 12-column layout grid ("dev mode")
 *  • Type   k k s       → same, plus a toast
 *  • Open DevTools      → a hello message in the console
 */
export default function EasterEgg() {
  const [grid, setGrid] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    console.log(
      "%c KKS %c Hey, curious dev 👋  Press G (or type “kks”) to see the grid this site is built on.",
      "background:#2b4bff;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px",
      "color:#888;padding-left:6px"
    );

    let buffer = "";
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      buffer = (buffer + k).slice(-3);

      if (buffer === "kks") {
        setGrid(true);
        setToast("You found it — dev mode on. Press G to toggle.");
        buffer = "";
        return;
      }
      if (k === "g") {
        setGrid((g) => {
          setToast(!g ? "Grid on — 12 columns, 24px gutters." : "Grid off.");
          return !g;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      <AnimatePresence>
        {grid && (
          <motion.div
            className="kks-devgrid"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="kks-devgrid-col"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.6, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="kks-toast"
            role="status"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="kks-toast-dot" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

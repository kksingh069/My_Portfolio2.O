"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useMenu } from "@/components/menu/MenuContext";

const dotVariants = {
  // no opacity here — CSS sets the default 0.55 via .kks-header-dot
  rest: () => ({ scale: 1 }),
  hover: (i) => ({
    scale: [1, 1.5, 1],
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Header() {
  const { isMenuOpen, toggleMenu } = useMenu();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-8 md:px-16">

      {/* Left: KKS brand */}
      <motion.div
        className="cursor-pointer text-white font-heading tracking-[0.15em] text-2xl"
        style={{
          textShadow: "0 2px 10px rgba(255, 255, 255, 0.15)"
        }}
        whileHover={{ opacity: 0.75 }}
        transition={{ duration: 0.4 }}
        data-cursor-hover
      >
        KKS
      </motion.div>

      {/* Right: Let's talk + Menu buttons */}
      <AnimatePresence initial={false}>
        {!isMenuOpen && (
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Let's talk CTA — solid white pill */}
            <motion.a
              href="#contact"
              className="flex items-center gap-2 cursor-pointer bg-white rounded-full"
              style={{ padding: "0.42rem 1.0rem" }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              data-cursor-hover
            >
              <span
                className="text-black text-[9px] tracking-[0.22em] uppercase"
                style={{ fontFamily: "var(--font-albert-sans)" }}
              >
                Let&apos;s talk
              </span>
              <PaperPlaneTilt weight="fill" size={10} className="text-black opacity-70" />
            </motion.a>

            {/* Menu trigger */}
            <motion.div
              className="flex items-center gap-4 cursor-pointer kks-glass-button kks-glass-menu-btn"
              onClick={toggleMenu}
              data-cursor-hover
            >
              <span
                className="text-white text-[9px] tracking-[0.22em] uppercase"
                style={{ fontFamily: "var(--font-albert-sans)" }}
              >
                Menu
              </span>

              <motion.div
                className="grid grid-cols-2 gap-[4px]"
                initial="rest"
                whileHover="hover"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={dotVariants}
                    className="block w-[3.5px] h-[3.5px] rounded-full bg-white kks-header-dot"
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}

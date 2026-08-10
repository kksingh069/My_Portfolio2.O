"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverType, setHoverType] = useState("normal"); // "menu", "logo", "text", "normal"
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Elegant, fully damped trailing spring config
  const springConfig = { damping: 24, stiffness: 100, mass: 0.8 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const tag = target.tagName.toLowerCase();
      
      const isMenuTrigger = target.closest(".kks-menu-trigger-label") || target.closest(".grid-cols-2") || target.closest("[aria-label='Close menu']") || target.closest(".kks-menu-close");
      const isLogo = target.classList.contains("font-heading") && target.innerText === "KKS";
      
      const isText = 
        tag === "p" || 
        tag === "span" || 
        tag === "h1" || 
        tag === "h2" || 
        tag === "h3" || 
        tag === "h4";

      const isInteractive =
        tag === "a" ||
        tag === "button" ||
        isText ||
        target.closest("[data-cursor-hover]") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(isInteractive);

      if (isMenuTrigger) {
        setHoverType("menu");
      } else if (isLogo) {
        setHoverType("logo");
      } else if (isText) {
        setHoverType("text");
      } else {
        setHoverType("normal");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  // Dynamic animations depending on target hover type
  const getOuterLayout = () => {
    switch (hoverType) {
      case "menu":
        return { width: 64, height: 64, marginLeft: -12, marginTop: -12 };
      case "logo":
        return { width: 60, height: 60, marginLeft: -10, marginTop: -10 };
      case "text":
        return { width: 54, height: 54, marginLeft: -7, marginTop: -7 };
      default:
        return isHovering 
          ? { width: 56, height: 56, marginLeft: -8, marginTop: -8 }
          : { width: 40, height: 40, marginLeft: 0, marginTop: 0 };
    }
  };

  const getInnerLayout = () => {
    switch (hoverType) {
      case "menu":
        return {
          width: 64,
          height: 64,
          borderRadius: "50%",
          boxShadow: "0 0 40px 10px rgba(255, 255, 255, 0.4)",
        };
      case "logo":
        return {
          width: 60,
          height: 60,
          borderRadius: "50%",
          boxShadow: "0 0 35px 8px rgba(255, 255, 255, 0.35)",
        };
      case "text":
        return {
          width: 54,
          height: 54,
          borderRadius: "50%",
          boxShadow: "0 0 32px 8px rgba(255, 255, 255, 0.28)",
        };
      default:
        return isHovering
          ? { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 0 30px 8px rgba(255, 255, 255, 0.35)" }
          : { width: 20, height: 20, borderRadius: "50%", boxShadow: "0 0 24px 5px rgba(255, 255, 255, 0.3)" };
    }
  };

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
      }}
      animate={getOuterLayout()}
      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white"
        animate={getInnerLayout()}
        transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
      />
    </motion.div>
  );
}

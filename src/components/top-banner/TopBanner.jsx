"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const FlakesCanvas = dynamic(() => import("./FlakesCanvas"), { ssr: false });

export default function TopBanner() {
  return (
    <section 
      className="relative w-full h-[95vh] min-h-[700px] overflow-hidden flex flex-col justify-between p-8 md:p-16 border-b border-zinc-900/60 select-none"
      style={{ backgroundColor: "#212121" }}
    >
      
      {/* Interactive Shiny Particle Sphere Background — fills entire top section space */}
      <div className="absolute inset-0 z-0 opacity-100 w-full h-full">
        <FlakesCanvas />
      </div>

      {/* Top Meta Details bar */}
      <div className="relative z-10 flex justify-between items-start w-full pt-12">
        <div className="flex flex-col gap-1 max-w-[240px]">
          <span className="font-mono text-[9px] tracking-[0.24em] text-zinc-400/80 uppercase">System Status</span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-200 uppercase flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-zinc-300 rounded-full animate-pulse" />
            Flakes Matrix &bull; Active
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="font-mono text-[9px] tracking-[0.24em] text-zinc-400/80 uppercase">Coordinates</span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-200 uppercase">
            [28.6139° N, 77.2090° E]
          </span>
        </div>
      </div>

      {/* Central bold display name & title */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center pointer-events-none">
        <motion.span 
          className="font-mono text-[10px] tracking-[0.35em] text-zinc-400 uppercase mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          KRISHNA KANT SINGH
        </motion.span>
        
        <motion.h1 
          className="font-heading text-zinc-100 text-5xl md:text-8xl tracking-[0.06em] leading-[0.9] uppercase"
          style={{
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 10px 40px rgba(0, 0, 0, 0.25)"
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          CREATIVE<br />ENGINEER
        </motion.h1>
      </div>

      {/* Bottom technical info row */}
      <div className="relative z-10 flex justify-between items-end w-full border-t border-zinc-700/30 pt-6">
        <div className="flex gap-12 font-mono text-[9px] tracking-[0.2em] text-zinc-400 uppercase">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500">Core Engine</span>
            <span className="text-zinc-300">REACT / R3F / MOTION</span>
          </div>
        </div>

        <div className="font-mono text-[9px] tracking-[0.16em] text-zinc-400 uppercase flex items-center gap-2">
          <span className="text-zinc-500">Flow</span>
          <span className="text-zinc-200 animate-pulse">&bull; ACTIVE</span>
        </div>
      </div>

    </section>
  );
}

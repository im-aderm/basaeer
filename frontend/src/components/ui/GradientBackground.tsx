"use client";

import React from "react";
import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <div className="absolute inset-0 -z-50 overflow-hidden bg-background">
      {/* Aurora Blob 1 */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-aurora-purple filter blur-[120px] opacity-40 md:opacity-50"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Blob 2 */}
      <motion.div
        className="absolute top-[40%] -right-[10%] h-[700px] w-[700px] rounded-full bg-aurora-blue filter blur-[140px] opacity-30 md:opacity-40"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -70, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Grid Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}

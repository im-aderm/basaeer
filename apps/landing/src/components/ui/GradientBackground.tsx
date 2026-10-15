"use client";

import React from "react";

export function GradientBackground() {
  return (
    <div className="absolute inset-0 -z-50 overflow-hidden bg-background">
      {/* Aurora Blob 1 - using CSS animation for hardware acceleration */}
      <div
        className="absolute -top-[20%] -left-[10%] h-[300px] w-[300px] md:h-[600px] md:w-[600px] rounded-full bg-aurora-purple filter blur-[60px] md:blur-[120px] opacity-35 md:opacity-50 animate-aurora-1 will-change-transform"
        style={{ transform: "translateZ(0)" }}
      />

      {/* Aurora Blob 2 - using CSS animation for hardware acceleration */}
      <div
        className="absolute top-[40%] -right-[10%] h-[350px] w-[350px] md:h-[700px] md:w-[700px] rounded-full bg-aurora-blue filter blur-[70px] md:blur-[140px] opacity-25 md:opacity-40 animate-aurora-2 will-change-transform"
        style={{ transform: "translateZ(0)" }}
      />

      {/* Subtle Grid Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
}


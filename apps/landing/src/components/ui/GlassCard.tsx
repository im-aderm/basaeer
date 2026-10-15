"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: "glow" | "magnetic" | "none";
  glowColor?: string;
  className?: string;
}

export function GlassCard({
  children,
  hoverEffect = "glow",
  glowColor = "rgba(124, 58, 237, 0.15)",
  className,
  ...props
}: GlassCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      450px circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 80%
    )
  `;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-2xl glass-card overflow-hidden transition-all duration-300",
        className
      )}
      {...props}
    >
      {hoverEffect === "glow" && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
          style={{ background }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

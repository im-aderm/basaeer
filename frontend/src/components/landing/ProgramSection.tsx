"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProgramSection() {
  const academics = [
    {
      title: "Early Years",
      subtitle: "Laying foundations of wonder.",
      image: "/placeholder.svg",
      link: "#about",
    },
    {
      title: "Primary",
      subtitle: "Igniting critical exploration.",
      image: "/placeholder.svg",
      link: "#programs",
    },
    {
      title: "Secondary",
      subtitle: "Mastering complex horizons.",
      image: "/placeholder.svg",
      link: "#programs",
    },
    {
      title: "STEM Excellence",
      subtitle: "Engineering future realities.",
      image: "/placeholder.svg",
      link: "#about",
    },
    {
      title: "Tahfeez",
      subtitle: "Preserving divine light.",
      image: "/placeholder.svg",
      link: "#programs",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(2);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % academics.length);
  };

  const [touchStartX, setTouchStartX] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + academics.length) % academics.length);
  };

  return (
    <section id="programs" className="relative w-full overflow-hidden py-24 bg-surface-dim">
      {/* Top Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent absolute top-0"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16 text-center">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold tracking-[0.2em] text-primary uppercase block">
            OUR SCHOOL SECTIONS
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading">
            Academic Pathways
          </h2>
          <p className="text-text-secondary text-sm md:text-base font-medium">
            Explore our specialized educational phases designed to elevate intellect, character, and spirit. Click any card to center it, and click again to visit that section!
          </p>
        </div>

        {/* Majestic 3D Cover Flow Container */}
        <div 
          className="relative w-full flex items-center justify-center min-h-[480px] perspective-[1200px] overflow-visible py-10 select-none"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (diff > 50) handleNext();
            if (diff < -50) handlePrev();
          }}
        >
          <div className="relative w-full max-w-5xl flex items-center justify-center h-[420px] overflow-visible">
            {academics.map((academic, idx) => {
              // Calculate offset from the active center index
              const offset = idx - activeIndex;
              const isActive = idx === activeIndex;

              // 3D Math logic for exact overlapping Cover Flow simulation (with narrower desktop spacing for perfect alignment)
              const translateVal = offset * 210; 
              const rotateYVal = offset * -18;
              const scaleVal = isActive ? 1.12 : 0.82;
              const zIndexVal = 30 - Math.abs(offset) * 10;
              const opacityVal = Math.abs(offset) > 2 ? 0.2 : isActive ? 1 : 0.65;

              return (
                <motion.div
                  key={idx}
                  onClick={() => {
                    if (isActive) {
                      window.location.href = academic.link;
                    } else {
                      setActiveIndex(idx);
                    }
                  }}
                  animate={{
                    x: translateVal,
                    scale: scaleVal,
                    rotateY: rotateYVal,
                    zIndex: zIndexVal,
                    opacity: opacityVal,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                  }}
                  style={{ transformOrigin: "center center" }}
                  className={`absolute w-[280px] md:w-[320px] h-[380px] md:h-[420px] rounded-[32px] overflow-hidden cursor-pointer shadow-2xl border transition-shadow duration-300 ${
                    isActive
                      ? "border-primary/60 shadow-primary/15 shadow-2xl"
                      : "border-border/40 shadow-black/10 hover:border-primary-light/20"
                  } group`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={academic.image}
                      alt={academic.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={`object-cover transition-transform duration-700 ${
                        isActive ? "scale-100" : "scale-105 saturate-[0.8]"
                      }`}
                      priority={idx === 2}
                    />
                    {/* Dark Elegant Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  </div>

                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 text-left">
                    <motion.div 
                      animate={{ y: isActive ? 0 : 5 }}
                      className="space-y-2 text-white"
                    >
                      <h4 className="text-2xl md:text-3xl font-extrabold text-white font-heading tracking-wide">
                        {academic.title}
                      </h4>
                      <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-medium">
                        {academic.subtitle}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Shifting Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8 z-30 relative">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-background border border-border/60 flex items-center justify-center text-text-primary hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow-md active:scale-95 transition-all duration-300"
            aria-label="Previous Section"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Visual dots representing current slide */}
          <div className="flex items-center gap-2">
            {academics.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-text-secondary"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-background border border-border/60 flex items-center justify-center text-text-primary hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow-md active:scale-95 transition-all duration-300"
            aria-label="Next Section"
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent absolute bottom-0"></div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

export function TrustedBySection() {
  const brands = [
    "CAMBRIDGE ACADEMY",
    "AZHAR AL-SHARIF",
    "UNESCO GLOBAL EDUCATION",
    "BRITISH COUNCIL PARTNER",
    "ISLAMIC LEADERSHIP COUNCIL",
  ];

  // Repeat twice to allow seamless infinite scroll
  const repeatedBrands = [...brands, ...brands];

  return (
    <section className="py-12 bg-surface-container-lowest/50 border-y border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-text-secondary mb-8 opacity-70">
          Certified by World-Class Institutions
        </p>
        
        <div className="relative w-full flex overflow-x-hidden">
          {/* Moving Track */}
          <motion.div
            className="flex gap-16 shrink-0 items-center justify-around min-w-full"
            animate={{ x: [0, "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
          >
            {repeatedBrands.map((brand, idx) => (
              <span
                key={idx}
                className="text-lg lg:text-xl font-heading font-extrabold italic text-text-secondary hover:text-primary hover:text-glow transition-all duration-300 tracking-wider shrink-0"
              >
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

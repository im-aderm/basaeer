"use client";

import React, { useRef } from "react";
import Image from "next/image";

const logos = [
  { src: "/certifications/nbais.png", alt: "NBAIS" },
  { src: "/certifications/ubec.png", alt: "UBEC" },
  { src: "/certifications/kdubec.png", alt: "KDUBEC" },
  { src: "/certifications/waec.png", alt: "WAEC" },
  { src: "/certifications/neco.png", alt: "NECO" },
  { src: "/certifications/nssce.png", alt: "NSSCE" },
  { src: "/certifications/cac.png", alt: "CAC" },
];

export function TrustedBySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-surface-container-lowest/50 border-y border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-text-secondary mb-10 opacity-70">
          Certified by World-Class Institutions
        </p>

        <div
          ref={containerRef}
          className="relative w-full overflow-hidden marquee-group"
          onMouseEnter={() => {
            if (containerRef.current) {
              const track = containerRef.current.querySelector(".marquee-track") as HTMLElement;
              if (track) track.style.animationPlayState = "paused";
            }
          }}
          onMouseLeave={() => {
            if (containerRef.current) {
              const track = containerRef.current.querySelector(".marquee-track") as HTMLElement;
              if (track) track.style.animationPlayState = "running";
            }
          }}
        >
          <div className="flex items-center marquee-track" style={{ gap: "6rem" }}>
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={idx}
                className="shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

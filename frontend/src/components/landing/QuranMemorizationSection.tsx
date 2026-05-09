"use client";

import React from "react";
import { FlaskConical, Brain, Cloud as CloudIcon } from "lucide-react";

export function QuranMemorizationSection() {
  const edgeItems = [
    {
      title: "Modern Learning",
      description: "Adaptive curricula that evolve in real-time with global industry standards and technological shifts.",
      icon: <FlaskConical className="w-8 h-8 text-[#d2bbff]" />,
      bgColor: "bg-[#7c3aed]/10",
    },
    {
      title: "Expert Faculty",
      description: "Guided by industry veterans and PhD-level educators dedicated to personalized mentorship.",
      icon: <Brain className="w-8 h-8 text-[#adc6ff]" />,
      bgColor: "bg-[#0062d2]/10",
    },
    {
      title: "Digital Ecosystem",
      description: "A fully integrated cloud campus providing seamless access to resources from anywhere in the world.",
      icon: <CloudIcon className="w-8 h-8 text-[#c1c5df]" />,
      bgColor: "bg-white/5",
    },
  ];

  return (
    <section className="py-24 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16 space-y-4">
        <span className="text-xs font-bold tracking-[0.2em] text-[#d2bbff] uppercase inline-block">
          THE BASSER EDGE
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white font-heading">
          Why the Future Starts Here
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {edgeItems.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.2)] hover:border-[#d2bbff]/40 transition-all duration-300"
          >
            <div className={`w-16 h-16 rounded-2xl ${item.bgColor} flex items-center justify-center mb-6`}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold text-white font-heading mb-3">
              {item.title}
            </h3>
            <p className="text-[#ccc3d8] text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

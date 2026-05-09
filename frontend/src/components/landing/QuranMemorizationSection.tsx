"use client";

import React from "react";
import { FlaskConical, Brain, Cloud as CloudIcon } from "lucide-react";

export function QuranMemorizationSection() {
  const edgeItems = [
    {
      title: "Modern Learning",
      description: "Adaptive curricula that evolve in real-time with global industry standards and technological shifts.",
      icon: <FlaskConical className="w-8 h-8 text-accent-gold" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Expert Faculty",
      description: "Guided by industry veterans and PhD-level educators dedicated to personalized mentorship.",
      icon: <Brain className="w-8 h-8 text-accent-gold" />,
      bgColor: "bg-secondary/10",
    },
    {
      title: "Digital Ecosystem",
      description: "A fully integrated cloud campus providing seamless access to resources from anywhere in the world.",
      icon: <CloudIcon className="w-8 h-8 text-accent-gold" />,
      bgColor: "bg-surface-container/30",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 dark:from-secondary/12 dark:via-transparent dark:to-primary/12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-bold tracking-[0.2em] text-primary-light uppercase inline-block">
            THE BASAEER EDGE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading">
            Why the Future Starts Here
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {edgeItems.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-card p-8 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.2)] hover:border-primary-light/40 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.bgColor} flex items-center justify-center mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-primary font-heading mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-light/30 to-transparent"></div>
    </section>
  );
}

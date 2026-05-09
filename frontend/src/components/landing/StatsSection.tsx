"use client";

import React from "react";

export function StatsSection() {
  const stats = [
    { value: "1.2k+", label: "Global Students", border: "border-b-[#d2bbff]/50", color: "text-[#d2bbff]" },
    { value: "85+", label: "PhD Faculty", border: "border-b-[#adc6ff]/50", color: "text-[#adc6ff]" },
    { value: "99%", label: "Graduation Rate", border: "border-b-[#c1c5df]/50", color: "text-[#c1c5df]" },
    { value: "40+", label: "Research Labs", border: "border-b-[#7c3aed]/50", color: "text-[#7c3aed]" },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-white/5 backdrop-blur-md p-8 rounded-3xl text-center border border-white/10 border-b-4 ${stat.border} hover:scale-[1.03] transition-all duration-300`}
          >
            <h3 className={`text-4xl lg:text-5xl font-extrabold font-heading ${stat.color} mb-2 tracking-tight`}>
              {stat.value}
            </h3>
            <p className="text-xs font-bold tracking-wider text-[#ccc3d8] uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

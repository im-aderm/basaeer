"use client";

import React from "react";

export function StatsSection() {
  const stats = [
    { value: "1.2k+", label: "National Presence", border: "border-b-primary-light/50", color: "text-primary-light" },
    { value: "85+", label: "Huffaz", border: "border-b-secondary/50", color: "text-secondary" },
    { value: "99%", label: "Graduation Rate", border: "border-b-primary-light/50", color: "text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary" },
    { value: "40+", label: "Certified Educators", border: "border-b-primary/50", color: "text-primary" },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`glass-card p-8 rounded-3xl text-center border-b-4 ${stat.border} hover:scale-[1.03] transition-all duration-300`}
          >
            <h3 className={`text-4xl lg:text-5xl font-extrabold font-heading ${stat.color} mb-2 tracking-tight`}>
              {stat.value}
            </h3>
            <p className="text-xs font-bold tracking-wider text-text-secondary uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

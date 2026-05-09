"use client";

import React from "react";

export function AboutSection() {
  return (
    <section id="about" className="py-20 relative max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 border-l-4 border-l-[#7c3aed] space-y-4">
          <h2 className="text-3xl font-extrabold text-white font-heading">
            Our Mission
          </h2>
          <p className="text-[#ccc3d8] text-base md:text-lg leading-relaxed font-medium">
            To cultivate an environment where intellectual curiosity is fueled by cutting-edge technology, fostering leaders who are grounded in wisdom and ready for the challenges of a digital future.
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 border-l-4 border-l-[#adc6ff] space-y-4">
          <h2 className="text-3xl font-extrabold text-white font-heading">
            Our Vision
          </h2>
          <p className="text-[#ccc3d8] text-base md:text-lg leading-relaxed font-medium">
            To become the global gold standard for hybrid education, seamlessly integrating traditional humanistic values with the boundless possibilities of artificial intelligence and innovation.
          </p>
        </div>
      </div>
    </section>
  );
}

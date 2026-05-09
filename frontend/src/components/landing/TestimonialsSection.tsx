"use client";

import React from "react";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Al-Mansour",
      role: "Senior Architect & Parent",
      content: "The transition to Basser's digital-first approach has transformed my son's perspective on learning. He's no longer just consuming information; he's creating solutions.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBik4wtOuA5reBFti-GQhHVM6KtxcJI9pOFwuLun0faHVGqphtttFlRS2BjuiErB9amyP9DdOsmdllE1i3mIicrrhohtjJ7dyPLSFcRUr9JYrCWyaOZSmzTxaWf4HvXdjO9eJu3HkAJFRMu7e1xQb0Y4L3RzfZAgixFKfRHjke-d4DN7_IbZnbubYbezGPD4jkd-c5odem8CPgjviojhHxGzYHkxPa_ipTI_T0QB2nA3Dh6kGmV0tb6LXRE5kENSchYlAqjlQGkOYU",
      color: "text-[#d2bbff]",
      border: "border-[#d2bbff]",
    },
    {
      name: "Dr. James Wilson",
      role: "Research Scientist & Parent",
      content: "Basser School provides an unparalleled academic rigour. The faculty are world-class, and the facilities are straight out of a technology showcase.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjknUMzUuGqyJ8ZHDylqzAID1ZhVICqcWFOzyvIAo1s0FQMGf3JNysgE5Jno7Ktmp_lpdpvQvcrcw2CY2uOYDWUxgi8FNlPLZBAQY4rF6YXyk54S2pZ-PNy6UQUgfEFzfz71vo9O9fDf94CtTKq-Rmn2qNIqmzetw2-T3IW_KIgu9s6V1W_X8FGsNJ536sjpkH4SZsw7L6ifxgJWwJ4E-6Kju88eCScdQIqWCeVGQniTtGQwSWaIPXryU9H9N5G_QW86dLxrMJTsw",
      color: "text-[#adc6ff]",
      border: "border-[#adc6ff]",
    },
  ];

  return (
    <section className="py-24 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center font-heading">
          Voices of the Community
        </h2>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, idx) => (
          <div 
            key={idx} 
            className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4">
              <img 
                alt={t.name} 
                className={`w-12 h-12 rounded-full border-2 ${t.border}`} 
                src={t.avatar} 
              />
              <div>
                <h4 className="text-lg font-bold text-white font-heading">{t.name}</h4>
                <p className="text-xs text-[#ccc3d8] font-semibold">{t.role}</p>
              </div>
            </div>

            <div className="flex gap-1 text-[#d2bbff]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" className={t.color} />
              ))}
            </div>

            <p className="text-[#ccc3d8] text-base leading-relaxed italic font-medium">
              "{t.content}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

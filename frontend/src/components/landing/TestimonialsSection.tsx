"use client";

import { Star, MessageSquareQuote } from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Fatima Al-Hassan",
      role: "Parent of Grade 4 Student",
      content:
        "Basaeer has transformed my son. The balance between secular education and Quran memorization is exactly what we were looking for. Highly recommended!",
      avatar: "https://i.pravatar.cc/150?u=fatima",
    },
    {
      name: "Mr. Ibrahim Musa",
      role: "Parent of Boarding Student",
      content:
        "The boarding facilities are safe and disciplined. My daughter is learning independence and leadership skills alongside her academics.",
      avatar: "https://i.pravatar.cc/150?u=ibrahim",
    },
    {
      name: "Mrs. Aisha Bello",
      role: "Parent of Nursery Student",
      content:
        "The nursery staff are so caring. They made my daughter's transition to school so smooth. She comes home happy every single day.",
      avatar: "https://i.pravatar.cc/150?u=aisha",
    },
  ];

  return (
    <SectionWrapper id="testimonials" className="bg-surface-container-low">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider">
          Testimonials
        </div>
        <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
          What Parents Say <br />
          <span className="text-gradient-primary">About Basaeer</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <GlassCard
            key={idx}
            className="p-8 relative flex flex-col justify-between h-full bg-background/40"
            hoverEffect="glow"
          >
            <div className="absolute top-8 right-8 text-primary/15">
              <MessageSquareQuote size={40} aria-hidden="true" />
            </div>

            <div className="flex gap-1 mb-6 text-accent-gold" aria-label="5 stars rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
              ))}
            </div>

            <p className="text-text-secondary text-base mb-8 leading-relaxed italic font-medium">
              &quot;{testimonial.content}&quot;
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto w-full">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-surface-container">
                <Image
                  src={testimonial.avatar}
                  alt={`Avatar of ${testimonial.name}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary text-sm">{testimonial.name}</h4>
                <p className="text-xs text-primary font-bold tracking-wider uppercase mt-0.5">{testimonial.role}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}

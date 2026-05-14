"use client";

import React from "react";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export function CampusesSection() {
  const campuses = [
    {
      name: "Ikeja City Campus",
      location: "Lagos, Nigeria",
      tag: "MAIN CAMPUS",
      image: "/placeholder.svg",
    },
    {
      name: "Victoria Island Branch",
      location: "Lagos, Nigeria",
      tag: "ESTATE WING",
      image: "/placeholder.svg",
    },
    {
      name: "Abuja Heights Campus",
      location: "Abuja, Nigeria",
      tag: "NORTHERN HUB",
      image: "/placeholder.svg",
    },
  ];

  return (
    <SectionWrapper id="campuses" className="bg-surface-container-low border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Our Locations
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
            Our Campuses
          </h2>
          <p className="text-text-secondary text-sm font-semibold mt-2">
            Strategic locations designed for safety, focus, and community.
          </p>
        </div>

        <button className="text-primary font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 group cursor-pointer hover:text-primary-hover">
          View All Locations <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {campuses.map((campus, idx) => (
          <GlassCard
            key={idx}
            className="flex flex-col h-full bg-background/40 rounded-[2rem] border border-border group relative overflow-hidden p-2"
            hoverEffect="glow"
          >
            {/* Image Box */}
            <div className="rounded-[1.75rem] overflow-hidden mb-6 h-64 relative w-full">
              <Image
                src={campus.image}
                alt={campus.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute top-4 left-4 glass-card px-4 py-1.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-black/40 border border-white/10 text-white">
                {campus.tag}
              </div>
            </div>

            {/* Campus details */}
            <div className="px-4 pb-6 space-y-2">
              <h3 className="text-2xl font-heading font-extrabold text-text-primary group-hover:text-primary transition-colors leading-tight">
                {campus.name}
              </h3>
              <p className="text-text-secondary text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
                {campus.location}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}

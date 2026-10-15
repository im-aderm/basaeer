"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Star, Building2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const CAMPUSES = [
  {
    name: "Kaduna Headquarters",
    slug: "kaduna",
    location: "Kaduna State, Nigeria",
    tag: "HQ & GIRLS COLLEGE",
    programs: "BQSC + Tahfeez (Day & Boarding)",
    image: "/placeholder.svg",
    isHQ: true,
  },
  {
    name: "Kano Boarding",
    slug: "kano",
    location: "Kano State, Nigeria",
    tag: "BOYS BOARDING",
    programs: "Al-Areefi & Birrul Walidain",
    image: "/placeholder.svg",
    campuses: "2 Campuses",
  },
  {
    name: "Plateau Centre",
    slug: "plateau",
    location: "Plateau State, Nigeria",
    tag: "DAY PROGRAMS",
    programs: "Quranic Memorization (BQMS)",
    image: "/placeholder.svg",
  },
  {
    name: "Bauchi — ALC",
    slug: "bauchi",
    location: "Bauchi State, Nigeria",
    tag: "SISTER INSTITUTION",
    programs: "Nursery, Primary, Secondary + Tahfeez",
    image: "/placeholder.svg",
    note: "Arrayyan Learning Centre",
  },
];

export function CampusesSection() {
  return (
    <SectionWrapper id="campuses" className="bg-surface-container-low border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            4 States Across Nigeria
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
            Our Campuses
          </h2>
          <p className="text-text-secondary text-sm font-semibold mt-2">
            Day and boarding programs for boys and girls ages 5–25 across Kaduna, Kano, Bauchi, and Plateau States.
          </p>
        </div>

        <Link
          href="/campuses"
          className="text-primary font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 group cursor-pointer hover:text-primary-hover"
        >
          View All Campuses <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CAMPUSES.map((campus) => (
          <Link key={campus.slug} href={`/campuses/${campus.slug}`}>
            <GlassCard
              className="flex flex-col h-full bg-background/40 rounded-[2rem] border border-border group relative overflow-hidden p-2"
              hoverEffect="glow"
            >
              {/* Image Box */}
              <div className="rounded-[1.75rem] overflow-hidden mb-4 h-48 relative w-full">
                <Image
                  src={campus.image}
                  alt={campus.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute top-3 left-3 glass-card px-3 py-1 rounded-full text-[9px] font-heading font-bold uppercase tracking-wider bg-black/40 border border-white/10 text-white flex items-center gap-1.5">
                  {campus.isHQ ? <Star size={10} className="text-accent-gold" /> : campus.campuses ? <Building2 size={10} /> : <MapPin size={10} />}
                  {campus.tag}
                </div>
              </div>

              {/* Campus details */}
              <div className="px-4 pb-5 space-y-1.5">
                <h3 className="text-xl font-heading font-extrabold text-text-primary group-hover:text-primary transition-colors leading-tight">
                  {campus.name}
                </h3>
                <p className="text-text-secondary text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  {campus.location}
                </p>
                <p className="text-[11px] text-text-secondary/70 leading-relaxed">
                  {campus.programs}
                </p>
                {campus.note && (
                  <p className="text-[10px] text-accent-gold/80 italic">{campus.note}</p>
                )}
                {campus.campuses && (
                  <p className="text-[10px] text-primary/80 font-semibold">{campus.campuses}</p>
                )}
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

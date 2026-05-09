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
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmf6VVfSVZxp7SgJQsKWL_dthrKffpAMKkW4WtED75sreTgtm9LiEyaMFtUunVeU90nDOqO1gVOVhQjrTepiHG6VY5aRM2O7qr6ExJ3aTXlkLdXGAvcUDV-XmKBEUbUn_FLbB-svSGUzcqLmhQqDhlmjZCdhVTNFk8cRa5ebOIqHEjvQ5BCPEC2I1Cn7GVhlDlqZfw5LktB4_6GuWq_J4-7BrMRNyVWS5bJxws3eNh9VCboAShCnUvQ9FEeds7YS72kEYGQgU4mis",
    },
    {
      name: "Victoria Island Branch",
      location: "Lagos, Nigeria",
      tag: "ESTATE WING",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABi_1ONsKLzDzm1XXCLZqZdnEOxX-proZq1Y8CmKSHdaBWo711SlrnT4eWabsvAyFbdKKjxMhpnf8a0kNgCNYMLxkMmqhIELz-7iXBw4Gz5gcJgIOpmpsOR4LGVwF70awmXdCYaV2buDG0Yexw1DUIyPSluOxhfYpV92GAek2jgLC5XqKLvO-tuZg00yeWh9uxzFQvws4qw96IQw9lQIbOMPpJX-b3nmweG-Sx2d88trKrnkIDhSl_xtCwGECTiYd-oHoi1Vw5x6A",
    },
    {
      name: "Abuja Heights Campus",
      location: "Abuja, Nigeria",
      tag: "NORTHERN HUB",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQnsxGCpe1Vfqe6TCYQCkiSiq1dO5lC7i3ehL54B-_r045PSNwGIkCLZ6ZzHiMzXBQaAC7ttioCgKu3GizPFgPX6syga_mAckyU00l3Kv5DrfQhPXJwxX8l9WfDPAwT_U_h7OmQRDsADorpJbaP-hVb14Rv8Sj8xgUCgsP0jlefuewRLJOyGANUk7pDn1CR6FmanOC0OGatp36zASyBuVvXXGJPiDYxw45d6RCiHZ6BfF8G3oerLyRwQG5t9-5tnBcgvj6zv3h_0",
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

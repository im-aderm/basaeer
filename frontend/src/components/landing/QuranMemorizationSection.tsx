"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function QuranMemorizationSection() {
  const points = [
    "Personalized Tajweed Mastery tracks for all levels.",
    "Digital tracking for students and parents via our app.",
    "Annual international Tahfeez competitions and rewards.",
  ];

  return (
    <SectionWrapper id="tahfeez" className="relative overflow-hidden bg-gradient-to-r from-surface-container-low to-[#064e3b]/20 py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Panel */}
          <div className="space-y-8 text-left">
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold leading-tight tracking-tight text-glow" style={{ color: "#6ee7b7" }}>
              Quran Memorization <br />Excellence
            </h2>
            <blockquote className="text-lg text-text-secondary italic font-semibold leading-relaxed max-w-xl">
              &quot;The best among you are those who learn the Qur&apos;an and teach it.&quot;
              <span className="block text-xs font-bold uppercase tracking-wider mt-2 not-italic text-primary">
                — Prophet Muhammad (PBUH)
              </span>
            </blockquote>

            <div className="space-y-4">
              {points.map((point, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">{point}</span>
                </div>
              ))}
            </div>

            <Link href="/admission/apply/1" className="inline-block bg-[#10b981] text-background hover:bg-[#059669] font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
              Join the Tahfeez Track
            </Link>
          </div>

          {/* Right Visual Panel */}
          <div className="relative w-full h-[500px]">
            <div className="relative w-full h-full rounded-[40px] overflow-hidden border-4 border-[#10b981]/20 shadow-2xl">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQIGL6iBShFXqaC4qv0Jl-LZulm6VXfMBLrxMMMExIO1OblY7j_V1dqdrBlTMZQIpTzbMi_Tr_e-_bMRw7Wo5qHoo563rP6-lsIiK3MHYwa2uV29iVZsBfIpHvrTsQXTqyjJav6IkOEUivTc0j0LDhYOvdAoKkV-_kc_NQpbY2AtWz_zgw6f3o5pQXlug0WxLVREDyIzORz3zLETGULO2ryja6jGEeGs9YHaf1889YPJaaFN0gLMoPhthdR1JPeWuW472uaqrWIBk"
                alt="Holy Quran studies"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[#064e3b]/10 mix-blend-color" />
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
}

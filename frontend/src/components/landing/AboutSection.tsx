"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Users, Shield, Cpu } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export function AboutSection() {
  return (
    <SectionWrapper id="about">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider">
          Beyond Education
        </div>
        <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
          What Makes <span className="text-gradient-primary">Basaeer Unique</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Bento Cell 1: Global Standards (Col Span 8) */}
        <GlassCard
          className="md:col-span-8 min-h-[380px] flex flex-col justify-end p-8 relative overflow-hidden rounded-[2.5rem] border border-border bg-background/20"
          hoverEffect="glow"
        >
          <div className="absolute inset-0 -z-10 opacity-30 group-hover:scale-105 transition-transform duration-700">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmFuNRQne3ALy1T594gzk4FLp_rkJFMgokQiqiPcjIXb_6InVyIGyk_pAT1Lwdmc7Wf8I9ywjkeSgLCEhKyrmgP4EkK0om8qWjmUbRoniQqj3QdI-joIji9G5ra1pYS2lfy3gf4qxDDC2MDggMrJOHLagxLJ6idmmRwfrqxSplA_KNROXVj2tyQwqH1ro85YDE9jgtLFM1-RMUDgfoj_UrKESVcvTAbSQe8x1-6DapderRod1UdCTiq48WUp-ZXDuNk7Q3RfyKixY"
              alt="Global Standards Laboratory"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent -z-10" />
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Academic Excellence
            </div>
            <h3 className="text-2xl lg:text-3xl font-heading font-extrabold text-text-primary">
              Global Standards, Local Context
            </h3>
            <p className="text-text-secondary text-sm max-w-xl font-medium leading-relaxed">
              Our curriculum is designed to exceed international standards while remaining deeply rooted in our community&apos;s unique cultural landscape.
            </p>
          </div>
        </GlassCard>

        {/* Bento Cell 2: Islamic Values (Col Span 4) */}
        <GlassCard
          className="md:col-span-4 min-h-[380px] flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] border-2 border-primary/25 bg-primary/5 shadow-2xl relative overflow-hidden"
          hoverEffect="glow"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(124,58,237,0.3)] border border-primary/30">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-extrabold text-text-primary mb-3">
            Islamic Values
          </h3>
          <p className="text-text-secondary text-sm font-medium leading-relaxed">
            Character building is at the heart of everything we do, instilling Taqwa and excellence in every student.
          </p>
        </GlassCard>

        {/* Bento Cell 3: Leadership (Col Span 4) */}
        <GlassCard
          className="md:col-span-4 min-h-[380px] flex flex-col justify-between p-8 rounded-[2.5rem] border border-border bg-background/20"
          hoverEffect="glow"
        >
          <div className="w-14 h-14 bg-surface-container rounded-2xl border border-border flex items-center justify-center text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-2 mt-8">
            <h3 className="text-2xl font-heading font-extrabold text-text-primary">
              Leadership
            </h3>
            <p className="text-text-secondary text-sm font-medium leading-relaxed">
              Fostering the next generation of pioneers, thinkers, and highly ethical leaders.
            </p>
          </div>
        </GlassCard>

        {/* Bento Cell 4: Digital Innovation (Col Span 8) */}
        <GlassCard
          className="md:col-span-8 min-h-[380px] flex flex-col justify-end p-8 relative overflow-hidden rounded-[2.5rem] border border-border bg-background/20"
          hoverEffect="glow"
        >
          <div className="absolute inset-0 -z-10 opacity-30 group-hover:scale-105 transition-transform duration-700">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyj0bKqbUn3jRJnAGeMUJssO1eZmMi79O58EYLgaolpnGNnVqH68wcAhAAtXB2mEnToyG3nLOCYf9XQH2lmdHdZ1UB6bciG65R_Tywht8OEXLuYpJHjsO1oEX5qeS5eOiSs8kOaDfFhOKpnp7SYMDhwYVbuk0AlzDUchV6sbwGpB2kkZSYevk5G-7B-fcLUtZurqDuJ44VRLZDaESQlfp-PRaDAIaPRbQGOnLEsWO-AERMQ9jEVZqo10YI2GqNv7sPquYFV0yfliM"
              alt="Robotics Workshop"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent -z-10" />
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> High-Tech Focus
            </div>
            <h3 className="text-2xl lg:text-3xl font-heading font-extrabold text-text-primary">
              Digital Innovation
            </h3>
            <p className="text-text-secondary text-sm max-w-xl font-medium leading-relaxed">
              From AI labs to digital libraries, we equip our students with the tools of the future.
            </p>
          </div>
        </GlassCard>

      </div>
    </SectionWrapper>
  );
}

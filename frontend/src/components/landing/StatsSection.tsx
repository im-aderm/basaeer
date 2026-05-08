"use client";

import { Building2, Users, GraduationCap, BookOpen } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export function StatsSection() {
  const stats = [
    { label: "Years Experience", value: "14+", icon: Building2 },
    { label: "Students Enrolled", value: "2,500+", icon: Users },
    { label: "Qualified Teachers", value: "150+", icon: GraduationCap },
    { label: "Huffaz Graduated", value: "500+", icon: BookOpen },
  ];

  return (
    <SectionWrapper id="stats" className="border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <GlassCard
              key={idx}
              className="p-8 rounded-2xl flex flex-col items-center justify-center text-center bg-background/30"
              hoverEffect="glow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
                <Icon size={24} aria-label={stat.label} />
              </div>
              <h3 className="text-4xl lg:text-5xl font-heading font-extrabold text-gradient-primary mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-text-secondary font-semibold text-sm">
                {stat.label}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

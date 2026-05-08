"use client";

import React from "react";
import Link from "next/link";
import { Baby, BookOpen, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export function ProgramSection() {
  const programs = [
    {
      title: "Nursery",
      description: "Early childhood development rooted in play, exploration, and foundational values.",
      icon: <Baby className="w-6 h-6 text-primary" />,
      href: "/admission/apply/1",
    },
    {
      title: "Primary",
      description: "Building critical thinkers through a robust dual curriculum of science and spirit.",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      href: "/admission/apply/1",
    },
    {
      title: "Secondary",
      description: "Empowering future leaders with advanced sciences and Islamic jurisprudence.",
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      href: "/admission/apply/1",
    },
    {
      title: "Tahfeez",
      description: "A specialized track for the memorization and mastery of the Holy Qur'an.",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      href: "/admission/apply/1",
    },
  ];

  return (
    <SectionWrapper id="programs" className="bg-surface-container-low">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider">
          Our Curriculum
        </div>
        <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary">
          Our <span className="text-gradient-primary">Educational Pathways</span>
        </h2>
        <p className="text-base text-text-secondary font-medium">
          Tailored educational journeys that respect individual growth and communal values.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {programs.map((program, idx) => (
          <GlassCard
            key={idx}
            className="p-8 flex flex-col h-full rounded-2xl border border-border bg-background/40 group relative overflow-hidden"
            hoverEffect="glow"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              {program.icon}
            </div>

            <h3 className="text-xl font-heading font-bold text-text-primary mb-3">{program.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 font-medium">
              {program.description}
            </p>

            <div className="pt-4 border-t border-border mt-auto w-full flex items-center justify-between">
              <Link href={program.href} className="text-xs font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1 hover:text-primary-hover">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}

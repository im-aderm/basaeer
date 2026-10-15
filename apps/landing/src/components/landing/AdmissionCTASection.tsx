"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function AdmissionCTASection() {
  return (
    <SectionWrapper id="admission-cta" className="relative px-6 py-20 border-t border-border overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto glass-panel rounded-[60px] p-12 lg:p-16 relative overflow-hidden border border-primary/60">
        
        {/* Moving blurred decorative accent blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary leading-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base lg:text-lg text-text-secondary font-medium leading-relaxed">
              Admission is currently open for all levels. Join a community that values wisdom as much as knowledge.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/admission/apply/1" className="bg-primary text-background font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              Download Prospectus
            </Link>
            <Link href="/#contact" className="glass-panel text-text-primary font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
              Book a Campus Tour
            </Link>
          </div>
        </div>

      </div>
    </SectionWrapper>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function NurseryPage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans overflow-hidden">
      <GradientBackground />
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Academics pathway
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
            Nursery School Pathway
          </h1>
          <p className="text-text-secondary font-medium leading-relaxed">
            We are currently designing and transforming our nursery early-childhood pathways to reflect the exact elite standards of the Stitch visual framework. Please check back shortly for full curriculum detail!
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container border border-border rounded-full hover:bg-surface-bright transition-all font-semibold text-sm cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

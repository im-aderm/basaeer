"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, School, BookOpen,} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Enrollment Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ENROLLING FOR 2024/25
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-text-primary leading-[1.1] tracking-tight"
              >
                Shaping <span className="text-gradient-primary">Future Leaders</span> with Celestial Wisdom
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg lg:text-xl text-text-secondary leading-relaxed font-medium max-w-xl"
              >
                At Basaeer, we bridge the gap between world-class academic excellence and profound spiritual growth, nurturing the minds and souls of the next generation.
              </motion.p>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <Link href="/login" className="btn-premium-primary px-8 py-4 text-sm font-bold text-white flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all cursor-pointer">
                Portal Login <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/#about" className="btn-premium-secondary px-8 py-4 text-sm font-bold transition-all cursor-pointer">
                Explore Academics
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Cinematic Scene with Floating Cards */}
          <div className="lg:col-span-6 relative w-full h-[500px] lg:h-[600px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full h-full relative"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full" />
              <GlassCard className="w-full h-full relative overflow-hidden rounded-[3rem] border border-border p-2 bg-background/30" hoverEffect="glow">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx82_5bBCvjPEtTR7-ydl9r1do8IsWBiDrdinqO4wf3dZtYjKWBS6rRy0_kZJyRhfwcxWmpK2sieo04ChH77YeGdFq67Gg-Ypx4kgsa8RDE7PylbgYYrPmA4hWADSPbuWxibb4c-qgdDgUjP64JXUu9HEJTb45QRvzXYlK9mRArhiIUdx3hfPnlFjZWCwGRkiot453L_nSIbk2jfKvtiamVNXVCyqscPh0pbOXAU0TRNmtK3jPBhjmDUOW2XZf48L9DIglbpqYM3Q"
                    alt="Cinematic Archway Basaeer"
                    fill
                    className="object-cover opacity-60 mix-blend-overlay hover:scale-110 transition-transform duration-[3s]"
                    unoptimized
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

                  {/* Floating Glass Card 1 (Top Right) */}
                  <div className="absolute top-10 right-10 glass-card p-4 rounded-xl border border-white/20 backdrop-blur-md animate-bounce [animation-duration:5s] flex items-center gap-3 bg-black/40">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-heading font-extrabold text-primary leading-none">99%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">Success Rate</p>
                    </div>
                  </div>

                  {/* Floating Glass Card 2 (Bottom Left) */}
                  <div className="absolute bottom-16 left-8 glass-card p-4 rounded-xl border border-white/20 backdrop-blur-md animate-bounce [animation-duration:7s] flex items-center gap-3 bg-black/40">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-heading font-extrabold text-primary leading-none">500+</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">Active Huffaz</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

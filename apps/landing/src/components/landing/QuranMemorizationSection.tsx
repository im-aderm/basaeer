"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Cloud, BarChart } from "lucide-react";

export function QuranMemorizationSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-surface-dim border-t border-b border-border/40 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-extrabold tracking-[0.2em] text-primary uppercase inline-block">
            THE BASAER EDGE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading">
            Why the Future Starts Here
          </h2>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto font-medium">
            Discover a sanctuary where intellectual depth is accelerated by digital innovation, nurturing well-rounded leaders of tomorrow.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* Card 1: Academic Excellence (Top Left - Wide Card) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}
            className="md:col-span-2 relative rounded-[32px] overflow-hidden min-h-[380px] flex flex-col justify-end group transition-all duration-300 border border-border/40 shadow-sm cursor-pointer"
          >
            {/* Background Image with Zoom on Hover */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/future-starts/female-child-landscape.png"
                alt="Student learning"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/50 to-transparent z-10" />
            </div>

            {/* Content Overlaid */}
            <div className="relative p-8 md:p-10 z-20 space-y-4 max-w-xl text-left text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <GraduationCap className="w-6 h-6 text-primary-light" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
                  Academic Excellence
                </h3>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                  A world-class curriculum integrating rigorous academic sciences, modern digital technology, and critical thinking to pave pathways into top global universities.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Spiritual Mentorship (Top Right - Narrow Card) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}
            className="bg-[#F5EBD9] rounded-[32px] p-8 md:p-10 flex flex-col justify-between min-h-[380px] transition-all duration-300 border border-amber-200/20 shadow-sm cursor-pointer text-left relative overflow-hidden"
          >
            {/* Background elegant circle decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#EFE3CF]/50 -translate-y-8 translate-x-8 z-0" />
            
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center border border-amber-200/40 shadow-inner z-10 relative">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>

            <div className="space-y-3 z-10 relative mt-16">
              <h3 className="text-2xl font-extrabold font-heading text-neutral-900">
                Spiritual Mentorship
              </h3>
              <p className="text-neutral-700 text-sm leading-relaxed font-medium">
                Guided by certified scholars and expert mentors dedicated to personalized moral development, Quranic memorization, and character building rooted in values.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Digital Ecosystem (Bottom Left - Narrow Card) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}
            className="bg-[#C2B29F] rounded-[32px] p-8 md:p-10 flex flex-col justify-between min-h-[380px] transition-all duration-300 border border-neutral-300/20 shadow-sm cursor-pointer text-left relative overflow-hidden"
          >
            {/* Background elegant circle decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#B8A793]/40 -translate-y-8 translate-x-8 z-0" />

            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner z-10 relative">
              <Cloud className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-3 z-10 relative mt-16 text-white">
              <h3 className="text-2xl font-extrabold font-heading text-white">
                Digital Ecosystem
              </h3>
              <p className="text-neutral-100 text-sm leading-relaxed font-medium">
                A fully integrated state-of-the-art virtual campus providing seamless access to digital resources, interactive classrooms, and global educational forums anytime.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Progress Tracking (Bottom Right - Wide Card) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}
            className="md:col-span-2 bg-[#516353] rounded-[32px] min-h-[380px] transition-all duration-300 border border-emerald-800/20 shadow-sm cursor-pointer text-left relative overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 h-full">
              {/* Left Content */}
              <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between h-full text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                  <BarChart className="w-6 h-6 text-primary-light" />
                </div>
                
                <div className="space-y-3 mt-16 md:mt-0">
                  <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
                    Tahfeez Analytics
                  </h3>
                  <p className="text-emerald-100 text-sm md:text-base leading-relaxed font-medium">
                    Visualize student memorization milestones, academic progression, and spiritual growth in real-time with comprehensive AI-powered progress dashboards.
                  </p>
                </div>
              </div>

              {/* Right Image */}
              <div className="md:col-span-5 h-[220px] md:h-full relative overflow-hidden">
                <Image
                  src="/future-starts/male-child-portrait.png"
                  alt="Student portrait"
                  className="object-cover object-top hover:scale-105 duration-700 ease-out transition-transform"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Visual fading gradient for seamless bento look */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#516353] to-transparent hidden md:block" />
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

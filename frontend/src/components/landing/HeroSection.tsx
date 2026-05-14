"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bolt } from "lucide-react";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  return (
    <header className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Video with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/BGs/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* 85% to 95% gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/90 to-background/95"></div>
        {/* Subtle Aurora glows atop the background */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] will-change-transform transform-gpu"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0062d2]/10 blur-[120px] will-change-transform transform-gpu"></div>
        <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] bg-aurora-gold rounded-full blur-[130px] opacity-70 will-change-transform transform-gpu"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Left Interactive Staggered Content */}
        <motion.div 
          className="lg:col-span-7 text-left space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            className="font-heading font-semibold text-xs tracking-[0.2em] text-primary-light uppercase inline-block"
            variants={itemVariants}
          >
            ESTABLISHED 2024
          </motion.span>
          
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary font-heading leading-tight"
            variants={itemVariants}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary drop-shadow-[0_0_15px_rgba(0,160,225,0.3)]">Raising Bright Minds</span> with Faith and Purpose.
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl font-medium"
            variants={itemVariants}
          >
            Where modern Western academics and authentic Qur’anic knowledge harmonize to nurture confident, morally grounded students prepared to thrive in this world and the Hereafter.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4 pt-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Link href="/login" className="px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors duration-300 cursor-pointer block">
                Login Portal
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Link href="/#programs" className="px-8 py-4 rounded-full glass-card text-primary-light font-bold text-sm hover:bg-surface-container/20 transition-all duration-300 cursor-pointer block">
                Explore Programs
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Floating Interactive Visuals */}
        <div className="lg:col-span-5 relative hidden lg:block">
          {/* Main levitating visual card */}
          <motion.div 
            className="glass-card p-3 rounded-3xl transform shadow-2xl overflow-hidden relative cursor-pointer"
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -12, 0],
              rotate: [3, 2, 3]
            }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: { repeat: Infinity, duration: 5, ease: "easeInOut" as const },
              rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" as const },
              default: { type: "spring", stiffness: 300, damping: 20 }
            }}
          >
            <Image 
              src="/hero-section.png"
              alt="Digital Dashboard" 
              width={500}
              height={350}
              priority
              className="rounded-2xl opacity-95 grayscale-[10%] hover:grayscale-0 transition-all duration-500 w-full object-contain" 
            />
            <div className="absolute top-6 left-6 bg-surface-container/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-border flex items-center gap-1.5">
              <Bolt size={14} className="text-accent-gold animate-pulse" />
              <span className="text-accent-gold text-[10px] font-bold uppercase tracking-wider">ACTIVE SESSIONS</span>
            </div>
          </motion.div>
          
          {/* Offset floating statistics badge */}
          <motion.div 
            className="absolute -bottom-6 -left-6 glass-card p-6 rounded-2xl shadow-2xl max-w-[180px] cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, 8, 0],
              rotate: [-6, -4, -6]
            }}
            whileHover={{ scale: 1.08 }}
            transition={{
              opacity: { duration: 0.8, delay: 0.4 },
              scale: { duration: 0.8, delay: 0.4 },
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" as const, delay: 0.5 },
              rotate: { repeat: Infinity, duration: 4.5, ease: "easeInOut" as const, delay: 0.5 },
              default: { type: "spring", stiffness: 300, damping: 15 }
            }}
          >
            <p className="text-4xl font-extrabold text-accent-gold font-heading">98%</p>
            <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mt-1">SUCCESS RATE</p>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bolt } from "lucide-react";

export function HeroSection() {
  return (
    <header className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Aurora glow backdrops */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0062d2]/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        <div className="lg:col-span-7 text-left space-y-6">
          <span className="font-heading font-semibold text-xs tracking-[0.2em] text-[#d2bbff] uppercase inline-block">
            ESTABLISHED 2024
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Shaping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d2bbff] to-[#adc6ff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Architects</span> of Tomorrow's Innovation.
          </h1>
          <p className="text-base sm:text-lg text-[#ccc3d8] leading-relaxed max-w-xl font-medium">
            Experience a digital-first elite education where tradition meets futuristic excellence. Our curriculum is designed to empower the next generation of global visionaries.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/login" className="px-8 py-4 rounded-full bg-[#7c3aed] text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer">
              Login Portal
            </Link>
            <Link href="/#programs" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-[#d2bbff] font-bold text-sm hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer">
              Explore Programs
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="bg-white/5 border border-white/10 p-3 rounded-3xl transform rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl overflow-hidden backdrop-blur-md relative">
            <img 
              alt="Digital Dashboard" 
              className="rounded-2xl opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-500 w-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNugBhMRw5ARDaZi_5jci57ZB_n1jVGdEOoDwmwMDFhGAvrSP9FASf0GmZ88PVrVkOxiIE2ghlNsoNf_GdMnmZvamPN6vyyvVi9gGSFZAY8V_nCqgpOnHwpTzKTRIYYXQsvoOk-PpF5isWqGc_brQRk5irp88c0MEQ4vTbDnbE6EgBx7vxLOzR_C3LLlOOsPi6imW3BSD-LJ2T0r7WJ1Dgxjh1c2Fx89FBX5AykW8TvzcDRG4nLcqS7KCcM5aDrAxJ4HFCdMyNx8c"
            />
            <div className="absolute top-6 left-6 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25 flex items-center gap-1.5">
              <Bolt size={14} className="text-[#d2bbff] animate-pulse" />
              <span className="text-[#d2bbff] text-[10px] font-bold uppercase tracking-wider">ACTIVE SESSIONS</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl max-w-[180px] transform -rotate-6">
            <p className="text-4xl font-extrabold text-[#d2bbff] font-heading">98%</p>
            <p className="text-[10px] font-bold text-[#ccc3d8] tracking-widest uppercase mt-1">SUCCESS RATE</p>
          </div>
        </div>
      </div>
    </header>
  );
}

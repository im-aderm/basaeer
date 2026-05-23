"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Languages, 
  Scale, 
  History, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Laptop 
} from "lucide-react";

const pillars = [
  {
    title: "Arabic Language",
    description: "Mastering the language of the Qur'an through immersive linguistics and classical literature studies.",
    icon: Languages,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBg: "hover:bg-emerald-500/20",
  },
  {
    title: "Fiqh & Sharia",
    description: "Understanding the divine logic and jurisprudence that guides an ethical and purposeful life.",
    icon: Scale,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-500/20",
  },
  {
    title: "Seerah",
    description: "Drawing inspiration from the life of the Prophet (PBUH) to navigate modern challenges.",
    icon: History,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBg: "hover:bg-emerald-500/20",
  },
  {
    title: "Akhlaq",
    description: "Cultivating noble character, integrity, and social responsibility in every student.",
    icon: HeartHandshake,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-500/20",
  },
];

const scholars = [
  {
    name: "Dr. Ahmed Al-Farsi",
    role: "DEAN OF SHARIA STUDIES",
    quote: "Knowledge is a light that Allah places in the heart.",
    image: "/placeholder.svg",
  },
  {
    name: "Ustadha Fatima Zahra",
    role: "DIRECTOR OF TARBIYAH",
    quote: "Excellence in character is the true fruit of all education.",
    image: "/placeholder.svg",
  },
  {
    name: "Shaykh Omar Khalil",
    role: "HEAD OF QUR'ANIC LINGUISTICS",
    quote: "Language is the key that unlocks the treasures of revelation.",
    image: "/placeholder.svg",
  },
];

export default function IslamicStudiesPage() {
  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5.878 18.09h19.022l-15.388 11.18 5.878 18.09-15.39-11.18-15.388 11.18 5.878-18.09L0 18.09h19.022L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7c3aed]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-bold text-[#d2bbff] tracking-[0.2em] uppercase block">
            ACADEMIC EXCELLENCE &amp; SPIRITUAL DEPTH
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Illuminating Hearts: <span className="text-[#d2bbff] drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">Our Spiritual Curriculum</span>
          </h1>
          <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
            At Basaer, we bridge the gap between contemporary education and timeless Islamic wisdom, nurturing students who are academically brilliant and spiritually anchored.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
              EXPLORE CURRICULUM
            </button>
            <button className="px-8 py-4 rounded-full text-white font-bold bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              VIRTUAL TOUR
            </button>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16 relative">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
            The Four Pillars
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7c3aed]/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.hoverBg} flex items-center justify-center transition-colors duration-300`}>
                  <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className={`text-2xl font-bold font-heading ${pillar.color}`}>
                  {pillar.title}
                </h3>
                <p className="text-[#ccc3d8] text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tarbiyah Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
            <Image
              alt="Islamic Education Scholar studying"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-60"
              src="/placeholder.svg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-transparent to-transparent"></div>
          </div>

          <div className="space-y-8">
            <span className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase block">
              HOLISTIC DEVELOPMENT
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
              The Essence of Tarbiyah
            </h2>
            <p className="text-lg text-[#ccc3d8] leading-relaxed">
              Education at Basaer extends beyond the classroom walls. Through our Tarbiyah program, we integrate Islamic values into every facet of daily life—from the way we greet one another to how we solve complex scientific problems.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white font-heading">Mindful Integration</h4>
                  <p className="text-sm text-[#ccc3d8] leading-relaxed">Connecting spiritual ethics with scientific inquiry and social studies.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white font-heading">Character Mentorship</h4>
                  <p className="text-sm text-[#ccc3d8] leading-relaxed">One-on-one guidance to foster resilience, empathy, and leadership.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Distinguished Scholars */}
      <section className="py-24 bg-[#100d16]/40 mb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
              Distinguished Scholars
            </h2>
            <p className="text-lg text-[#ccc3d8] max-w-2xl mx-auto">
              Guided by educators who embody the wisdom they teach, bridging generations of knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {scholars.map((sch) => (
              <div key={sch.name} className="text-center space-y-4 group">
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#7c3aed]/20 p-2 relative group-hover:border-[#7c3aed]/50 transition-colors duration-300">
                  <Image
                    alt={sch.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                    src={sch.image}
                  />
                </div>
                <h4 className="text-2xl font-bold text-white font-heading">
                  {sch.name}
                </h4>
                <p className="text-xs font-bold text-[#d2bbff] tracking-widest uppercase">
                  {sch.role}
                </p>
                <p className="text-[#ccc3d8] text-sm italic max-w-xs mx-auto">
                  &quot;{sch.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Integration */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16 relative overflow-hidden">
        <div className="bg-white/5 backdrop-blur-md p-8 md:p-16 rounded-[40px] border border-white/10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
                Where Tradition Meets Tomorrow
              </h2>
              <p className="text-lg text-[#ccc3d8] leading-relaxed">
                We utilize advanced educational technology—from VR historical walkthroughs to AI-assisted Arabic language tools—to bring traditional Islamic sciences to life for the digital generation.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <h5 className="text-3xl font-bold text-[#d2bbff] font-heading">98%</h5>
                  <p className="text-xs text-[#ccc3d8]">Global University Placement</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <h5 className="text-3xl font-bold text-[#d2bbff] font-heading">100%</h5>
                  <p className="text-xs text-[#ccc3d8]">Values-Based Integration</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    alt="Modern Technology Hologram"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    src="/placeholder.svg"
                  />
                </div>
                <div className="h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    alt="Digital Quranic studies"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    src="/placeholder.svg"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    alt="Modern science classroom discussion"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    src="/placeholder.svg"
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    alt="Group of high-achieving students portrait"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    src="/placeholder.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

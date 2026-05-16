"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  GraduationCap, 
  MapPin, 
  ArrowRight, 
  PlayCircle, 
  BookOpen, 
  Activity, 
  Compass, 
  Sparkles,
  Globe,
  Award,
  DollarSign
} from "lucide-react";

const stats = [
  { value: "2,500+", label: "Global Alumni", icon: Globe },
  { value: "98%", label: "Univ. Acceptance", icon: GraduationCap },
  { value: "$12M", label: "Scholarships", icon: DollarSign },
  { value: "45", label: "Countries", icon: Award },
];

const successStories = [
  {
    name: "Dr. Sarah Ahmed",
    classYear: "Class of 2012",
    quote: "The values of Tahfeez and rigorous science I learned at Basaer formed the foundation of my career in neurosurgery.",
    image: "/placeholder.svg",
    type: "medicine",
  },
  {
    name: "Omar Khalid",
    classYear: "Class of 2018",
    description: "AI Researcher at Google Brain, pioneering ethical machine learning algorithms.",
    image: "/placeholder.svg",
    type: "tech",
  },
  {
    name: "Zainab Yusuf",
    classYear: "Class of 2015",
    description: "Doctorate in Islamic Philosophy from Oxford University, focusing on modern ethics.",
    image: "/placeholder.svg",
    type: "philosophy",
  },
  {
    name: "Hassan Al-Farsi",
    classYear: "Class of 2010",
    description: "Founder of Oasis GreenTech, a leading renewable energy startup in the MENA region, providing sustainable solutions to millions.",
    image: "/placeholder.svg",
    type: "tech-founder",
  },
];

const universities = [
  "Harvard University",
  "Oxford University",
  "MIT",
  "Stanford University",
  "Cambridge University",
];

export default function AlumniPage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative overflow-hidden mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <span className="text-primary font-bold text-xs tracking-widest uppercase block">
                HONORING OUR GRADUATES
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-text-primary font-heading">
                Our Legacy: A Community of <span className="text-primary drop-shadow-[0_0_15px_rgba(0,160,225,0.4)]">Excellence.</span>
              </h1>
              <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
                Basaer alumni are world-shapers, innovators, and spiritual leaders. From prestigious labs to global corporate offices, our graduates carry the light of knowledge across the globe.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                  EXPLORE STORIES
                </button>
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container backdrop-blur-md border border-border hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  ALUMNI PORTAL
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden bg-surface-container p-2 border-2 border-primary/20 rotate-3 hover:rotate-0 transition-transform duration-700 relative">
                <Image 
                  alt="Alumni Professionals portrait collage" 
                  className="object-cover rounded-[32px]" 
                  src="/placeholder.svg" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Achievement Stats */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface-container backdrop-blur-md p-8 rounded-3xl border border-border text-center space-y-2 group hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-extrabold font-heading text-primary drop-shadow-[0_0_10px_rgba(0,160,225,0.3)]">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-text-secondary tracking-widest uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading">
              Success Stories
            </h2>
            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story Card 1 (Sarah Ahmed) - Double Span */}
            <div className="md:col-span-2 bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border border-border group hover:border-primary/60 transition-all duration-300">
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <Image 
                    alt={successStories[0].name} 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={successStories[0].image} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                </div>
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <span className="text-primary font-bold text-xs tracking-wider uppercase">
                    {successStories[0].classYear}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-text-primary font-heading">
                    {successStories[0].name}
                  </h3>
                  <p className="text-text-secondary text-base italic leading-relaxed">
                    &quot;{successStories[0].quote}&quot;
                  </p>
                  <button className="text-primary flex items-center gap-2 font-bold text-sm uppercase tracking-wider pt-2 hover:text-text-primary transition-colors">
                    Read Profile <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Story Card 2 (Omar Khalid) */}
            <div className="bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border border-border p-6 group hover:border-primary/60 transition-all duration-300 space-y-6">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image 
                  alt={successStories[1].name} 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={successStories[1].image} 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2">
                <span className="text-primary font-bold text-xs tracking-wider uppercase block">
                  {successStories[1].classYear}
                </span>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {successStories[1].name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {successStories[1].description}
                </p>
              </div>
            </div>

            {/* Story Card 3 (Zainab Yusuf) */}
            <div className="bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border border-border p-6 group hover:border-primary/60 transition-all duration-300 space-y-6">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image 
                  alt={successStories[2].name} 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={successStories[2].image} 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2">
                <span className="text-primary font-bold text-xs tracking-wider uppercase block">
                  {successStories[2].classYear}
                </span>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {successStories[2].name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {successStories[2].description}
                </p>
              </div>
            </div>

            {/* Story Card 4 (Hassan Al-Farsi) - Double Span */}
            <div className="md:col-span-2 bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border border-border group hover:border-primary/60 transition-all duration-300">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-8 flex flex-col justify-center space-y-4 order-2 md:order-1">
                  <span className="text-primary font-bold text-xs tracking-wider uppercase">
                    {successStories[3].classYear}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-text-primary font-heading">
                    {successStories[3].name}
                  </h3>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                    {successStories[3].description}
                  </p>
                  <button className="text-primary flex items-center gap-2 font-bold text-sm uppercase tracking-wider pt-2 hover:text-text-primary transition-colors">
                    Watch Interview <PlayCircle size={16} />
                  </button>
                </div>
                <div className="relative h-64 md:h-auto overflow-hidden order-1 md:order-2">
                  <Image 
                    alt={successStories[3].name} 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={successStories[3].image} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* University Placements */}
        <section className="py-24 bg-surface-container-low mb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
                Global University Placements
              </h2>
              <p className="text-lg text-text-secondary">
                Our graduates are accepted into the world's most prestigious institutions.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {universities.map((uni) => (
                <div key={uni} className="flex flex-col items-center space-y-2 group cursor-pointer">
                  <BookOpen className="text-primary w-10 h-10 group-hover:scale-110 group-hover:text-primary transition-all" />
                  <span className="text-lg font-bold text-text-primary font-heading">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alumni Network CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="bg-surface-container backdrop-blur-md rounded-[40px] p-8 md:p-16 relative overflow-hidden text-center border-2 border-primary/10 space-y-8">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="bg-primary/20 text-primary px-6 py-2 rounded-full font-bold text-xs tracking-wider uppercase inline-block">
                STAY CONNECTED
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-text-primary font-heading">
                Join the Global Network
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed">
                Reconnect with classmates, mentor current students, and access exclusive professional development opportunities. Your journey with Basaer doesn't end at graduation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-primary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                  Join the Community
                </button>
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container border border-border hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  Update Your Details
                </button>
              </div>
            </div>

            {/* Background Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

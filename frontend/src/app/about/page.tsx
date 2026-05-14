"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Lightbulb,
  Play,
  ArrowRight
} from "lucide-react";

const pillars = [
  {
    title: "Excellence",
    description: "Striving for the highest standards in academic rigor and personal achievement in every endeavor.",
    icon: Award,
  },
  {
    title: "Integrity",
    description: "Building a foundation of trust, honesty, and ethical leadership that guides every student's path.",
    icon: ShieldCheck,
  },
  {
    title: "Spirituality",
    description: "Nurturing the soul through Tahfeez and deep spiritual connection, aligning worldly success with eternal purpose.",
    icon: Sparkles,
    featured: true,
  },
  {
    title: "Innovation",
    description: "Embracing the technologies of tomorrow today, ensuring our students are prepared for the digital frontier.",
    icon: Lightbulb,
  },
];

const leaders = [
  {
    name: "Dr. Yusuf Al-Fayed",
    role: "Principal & Academic Dean",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_z3BPlAU7Rw9mMXBz1FFOwiIsQnsh8GcO43e_zlCZOmSyWr2gSvVen45wsEMnuv0-KA_VhCVajk07QV0sw9F0b1oqgm6cjEusNG73vYxewGrAkR6e9MurHk21qfknKKcn4fc-6vCjQ9XrkcXaSNazlU4c9Yv8ZKjHDPjtwJafysB8JXWbYWFPO_zYciuboNIvs7EpfkyI1GpDC1jIxiDYl3gkb6sfleLPflb5cDtqzIGZs-tDoGRI-HtjAF6ZPE4x7hrbAHqdePw",
  },
  {
    name: "Sheikh Ibrahim Mansour",
    role: "Head of Tahfeez Department",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwNpY3-SY61RXNtE042WcRX_OmKP0CADGPFcr4fTAJfVgh-rFM7zda79kGo06iVIm1A_cuMgK4PGXQhZMc932Iai3L82ZtP3okcOhkg9uLmyrHS0a7hqYbEW3-PaMMjmPTPkCCGkMjB5aL4tXQNYUijq9WGkN_yNIUUv9aLC2d3aq2jrpvPWdH-UHLZtIqNuneNj6H1lzSh--qgwnEMtrGFtAr2g53oJU3jnfXJ5xilUscH__I5vsl31EtVEVHeG14OGEX6JfV5A8",
  },
  {
    name: "Sarah Bin Khalid",
    role: "Chair of Board of Directors",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbhvhkub4JdjPI7tGboPqhW6cc7gqmwxBdtewZyLUMkcWD6FvfnKo_WpO5YrlnwO2cJtRyoEkIK03Tp2FXk8aSlkQak4W_jR2NGlXsjtkkZPYr1qAIhftEB-VpzL9PJwtWtXe5d8UGBt7j_Jb44nvvdBPp5Xn-5C5swoBIV_ndvdDWE-uTI7XEBbPcWyrWmLl4rrwbIuAxyWiu71n179tfRGxhYvu9BhRsZQStXnhKoU2VSHEh6nEoKC5YmDv83-RNK4QIsF-AjaY",
  },
];

const timeline = [
  {
    year: "1998",
    title: "The First Seed",
    description: "Founded in a small villa with only 50 students and a vision for holistic Islamic education.",
    position: "top",
  },
  {
    year: "2005",
    title: "Academic Milestone",
    description: "Achievement of national accreditation and expansion to our first purpose-built campus.",
    position: "bottom",
  },
  {
    year: "2015",
    title: "Digital Transformation",
    description: "Integrating STEM and high-tech labs, becoming a model for 21st-century Islamic learning.",
    position: "top",
  },
  {
    year: "2024",
    title: "Global Multi-Branch",
    description: "Now operating four campuses serving 5,000+ students across the region.",
    position: "bottom",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main>
        {/* Hero Section */}
        <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 px-6 lg:px-8">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-30" 
              alt="A grand cinematic view of a modern school library with high ceilings" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGsF1RaH7y_Yy8eL_LJjaaBhuxRQMdIHUnhDSUIrcJQlBoX9k4cauYuOBnJTXPxQe5bB2WZJ1Jm6IEeVhIJilPSq_4Phqc2-gcBwSd9MSmY8YYey_e0iMh0YCaBQ8bSm10J4m4xAG6pgAciZ2xzERW_lkokYGt7TgLVZg0V0ysEEEaHlWAArHuZMiZGb7ynRfYbwT72bp5jNGNI7pPhv_Ygp0gqPAdNYKlSQTDHPWPVkZdte0YDcyLcS7FvMOuM4BFmETfsNiE6lA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(0, 160, 225, 0.15) 0%, transparent 70%)"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-4xl space-y-6">
            <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
              ESTABLISHED 1998
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-white font-heading">
              Our Vision: <span className="text-primary drop-shadow-[0_0_15px_rgba(0,160,225,0.4)]">Building Minds, Illuminating Souls.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              A sanctuary where traditional wisdom meets future innovation. We craft leaders who are anchored in values and soaring in intellect.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                Explore Our Legacy
              </button>
              <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container backdrop-blur-md border border-border hover:bg-surface-container-high hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Play size={18} fill="currentColor" /> Watch Story
              </button>
            </div>
          </div>
        </header>

        {/* Mission & Values Grid */}
        <section className="py-24 relative overflow-hidden max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading">
                The Pillars of Basaer
              </h2>
              <p className="text-text-secondary text-base leading-relaxed">
                Our mission is to provide an educational experience that transcends textbooks, fostering a generation of thinkers and believers.
              </p>
            </div>
            <div className="h-px flex-grow bg-border mx-8 mb-4 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className={`bg-surface-container backdrop-blur-md p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl ${
                    pillar.featured 
                      ? "border-primary/50 shadow-[0_0_20px_rgba(0,160,225,0.1)]" 
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <Icon className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary font-heading mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-text-secondary text-base leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-text-primary font-heading mb-16">
              Meet Our Leadership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leaders.map((leader) => (
                <div 
                  key={leader.name}
                  className="group relative overflow-hidden rounded-3xl aspect-[3/4] border border-border hover:border-primary/30 transition-colors duration-500"
                >
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={leader.name} 
                    src={leader.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-surface-container backdrop-blur-md m-6 rounded-2xl border border-border transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <h4 className="text-xl font-bold text-primary font-heading">
                      {leader.name}
                    </h4>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">
                      {leader.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our History Timeline */}
        <section className="py-24 overflow-hidden relative max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading mb-16">
            Our Journey
          </h2>
          <div className="relative pt-12 pb-12">
            {/* Timeline Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transform -translate-y-1/2 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {timeline.map((node) => (
                <div key={node.year} className="relative group flex flex-col items-center md:items-start text-center md:text-left">
                  {/* Point */}
                  <div className="w-4 h-4 bg-primary rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_var(--primary)] hidden md:block"></div>
                  
                  <div className={`pt-6 md:pt-0 space-y-2 ${node.position === "bottom" ? "md:mt-16" : "md:-mt-16"}`}>
                    <span className="text-3xl font-bold text-primary block font-heading">
                      {node.year}
                    </span>
                    <h5 className="text-lg font-bold text-text-primary font-heading">
                      {node.title}
                    </h5>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                      {node.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* School Philosophy */}
        <section className="py-24 relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-surface-container backdrop-blur-md rounded-full border border-border mb-8">
            <Sparkles className="text-primary w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading mb-8">
            Our Philosophy
          </h2>
          <div className="space-y-6 text-lg text-text-secondary text-left leading-relaxed">
            <p>
              At Basaer Model School, we believe that education is not merely the transmission of facts, but the ignition of a divine light within every child. Our philosophy is rooted in the concept of <span className="text-primary italic font-semibold">Tarbiyah</span>—the holistic development of the individual.
            </p>
            <p>
              We reject the false dichotomy between &quot;secular&quot; and &quot;religious&quot; knowledge. Instead, we view all fields of study—from the intricate laws of physics to the profound rhythms of Quranic recitation—as part of a singular, beautiful tapestry of creation.
            </p>
            <p className="border-l-4 border-primary pl-6 py-4 font-heading text-xl md:text-2xl text-text-primary italic bg-surface-container rounded-r-2xl border border-border/50">
              &quot;The heart of education is the education of the heart.&quot;
            </p>
            <p>
              Our curriculum is designed to challenge the intellect while grounding the spirit. By merging high-end technology with traditional pedagogical values, we ensure our graduates are not just ready for the world, but ready to lead it with wisdom and compassion.
            </p>
          </div>

          {/* Floating Accents */}
          <div className="absolute -left-20 top-1/4 w-40 h-40 bg-primary/10 blur-[80px] rounded-full -z-10"></div>
          <div className="absolute -right-20 bottom-1/4 w-60 h-60 bg-secondary/10 blur-[100px] rounded-full -z-10"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

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
    quote: "The values of Tahfeez and rigorous science I learned at Basaeer formed the foundation of my career in neurosurgery.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhiPrhRHinYWVdJLeGdC3WnB8WKhMt9wFTzoKPgox_K9uyY82Z3ejfYkISAeS8IZpPlJSa_D0Cn5WAd_Axrd3j4ykYzqUjkX5UV7DImiG5hu7TyOIadE5OQXOJbTGyxbldwsyaZzOLuMUPbgSESqm4SAWHCdTYYk13X9mfsiDfcnhXB6E9XR4TYkOddbrrXWvJIBElCl-FHzOOxj6VuIN4u5BkyL0FMFjEINzhBmDqM4qTm-K9c90yqDP4rno8zo3KAKBUs18bFzc",
    type: "medicine",
  },
  {
    name: "Omar Khalid",
    classYear: "Class of 2018",
    description: "AI Researcher at Google Brain, pioneering ethical machine learning algorithms.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLc8v7_RASHqVxFWBLWPX_3dR_y6oBX_TaxrlvmmMlP7KtLxpiVo9a_stkQ0S-LbE4DSy5aIHTgNbRIZVNByzCl7HakpQkSN7Cg01uvbCLYteZh3bBYKosOla3WKdAJIcsWTWjo9afIUuzwZm7NVXWRFIOlGE6gPnJa3QjH9_4XU8yk8h8N6CORCpxrIaKofQHVDv3GckpO3xHlkLCOWlU0qm2dwj57R_iCaO4lkVyAhybJuWuw3s2yHk47bJu5x3Z_2mwS5Zg-4E",
    type: "tech",
  },
  {
    name: "Zainab Yusuf",
    classYear: "Class of 2015",
    description: "Doctorate in Islamic Philosophy from Oxford University, focusing on modern ethics.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcsQaJBIFGS8FzD647-sjjFzhRln70JJkRxivROpALYmImKuidmnh9Mekn51EfuFkvz-gBfeBA52Zm7iju5xw26bxx6hvXRrfqOr6tqTy5dM5E3gljcNbji1FI7Vcj-haXBuhFFWGrPk-Wrn-NwwMkZKcCx8g1YFTjJ96P7wZW9g4shtCoYazWstYkhxFFO0atQyt6T7LDn5G73-Igo4YD5rbJGh9MoHIcbfYX8Q05-9eQjI3n623nOSwG_DzUpm11bPp2Xj3hssQ",
    type: "philosophy",
  },
  {
    name: "Hassan Al-Farsi",
    classYear: "Class of 2010",
    description: "Founder of Oasis GreenTech, a leading renewable energy startup in the MENA region, providing sustainable solutions to millions.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8-ZplAXvSUb1b4zAOVZnBdzryYD_Q5SsQJUIuj4X3OBmyBW-g-iQhDWPcO2RuyCNFOWYRAdHf5sykSXYbT0lZW0FjKTZGlOicjRYYFPyCpal3h-YL6suJH68LDFMpuXc_5v8QdmY0E1-Ii9lJChRdjUu_SYadONBqxt87Ngwm1rrVBOsGS6M2YHipJW-CsQg58s-p1CctpBjJN1oDHqZgNGxRS1nVNAAZrY_YH2R1pXaSJnBmTAVYnUJb_HbgniyQfdPEJTYcgwg",
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
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative overflow-hidden mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <span className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase block">
                HONORING OUR GRADUATES
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-white font-heading">
                Our Legacy: A Community of <span className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Excellence.</span>
              </h1>
              <p className="text-[#ccc3d8] text-lg md:text-xl leading-relaxed">
                Basaeer alumni are world-shapers, innovators, and spiritual leaders. From prestigious labs to global corporate offices, our graduates carry the light of knowledge across the globe.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
                  EXPLORE STORIES
                </button>
                <button className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  ALUMNI PORTAL
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden bg-white/5 p-2 border-2 border-primary/20 rotate-3 hover:rotate-0 transition-transform duration-700 relative">
                <Image 
                  alt="Alumni Professionals portrait collage" 
                  className="object-cover rounded-[32px]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNLDTQgv3-kexg8o-n-HShUe9MbUvrvy6bKghyduYzs6Jsv_w_8uzaY3m-otj0yXsHlNpLx9GenbLya6RbJN8SKDsIaCWIXAH4BS_lpAZH1L2lQbF__87vPJwKATPZXIwnhXWNOZvyyX0GmUNd7xiH3CqvT9VLiCPyxNoPvHsXbjwclSRR0sh244fLuG0ivUVInz_LWmXv-aMxh4P5bW2qslTKOlQ91zWFPX7Qcq6N86QNx7Dpl9433sHnJokd1IDxKDbu-5AlGLk" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#adc6ff]/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Achievement Stats */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center space-y-2 group hover:border-[#7c3aed]/30 hover:shadow-2xl hover:shadow-[#7c3aed]/5 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-extrabold font-heading text-[#d2bbff] drop-shadow-[0_0_10px_rgba(210,187,255,0.3)]">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#ccc3d8] tracking-widest uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
              Success Stories
            </h2>
            <div className="w-20 h-1.5 bg-[#7c3aed] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story Card 1 (Sarah Ahmed) - Double Span */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 group hover:border-[#7c3aed]/30 transition-all duration-300">
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <Image 
                    alt={successStories[0].name} 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={successStories[0].image} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15121b]/80 to-transparent"></div>
                </div>
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase">
                    {successStories[0].classYear}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-heading">
                    {successStories[0].name}
                  </h3>
                  <p className="text-[#ccc3d8] text-base italic leading-relaxed">
                    &quot;{successStories[0].quote}&quot;
                  </p>
                  <button className="text-[#d2bbff] flex items-center gap-2 font-bold text-sm uppercase tracking-wider pt-2 hover:text-white transition-colors">
                    Read Profile <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Story Card 2 (Omar Khalid) */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 p-6 group hover:border-[#7c3aed]/30 transition-all duration-300 space-y-6">
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
                <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase block">
                  {successStories[1].classYear}
                </span>
                <h3 className="text-xl font-bold text-white font-heading">
                  {successStories[1].name}
                </h3>
                <p className="text-[#ccc3d8] text-sm leading-relaxed">
                  {successStories[1].description}
                </p>
              </div>
            </div>

            {/* Story Card 3 (Zainab Yusuf) */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 p-6 group hover:border-[#7c3aed]/30 transition-all duration-300 space-y-6">
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
                <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase block">
                  {successStories[2].classYear}
                </span>
                <h3 className="text-xl font-bold text-white font-heading">
                  {successStories[2].name}
                </h3>
                <p className="text-[#ccc3d8] text-sm leading-relaxed">
                  {successStories[2].description}
                </p>
              </div>
            </div>

            {/* Story Card 4 (Hassan Al-Farsi) - Double Span */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 group hover:border-[#7c3aed]/30 transition-all duration-300">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-8 flex flex-col justify-center space-y-4 order-2 md:order-1">
                  <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase">
                    {successStories[3].classYear}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-heading">
                    {successStories[3].name}
                  </h3>
                  <p className="text-[#ccc3d8] text-sm md:text-base leading-relaxed">
                    {successStories[3].description}
                  </p>
                  <button className="text-[#d2bbff] flex items-center gap-2 font-bold text-sm uppercase tracking-wider pt-2 hover:text-white transition-colors">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15121b]/80 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* University Placements */}
        <section className="py-24 bg-[#100d16]/40 mb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
                Global University Placements
              </h2>
              <p className="text-lg text-[#ccc3d8]">
                Our graduates are accepted into the world's most prestigious institutions.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {universities.map((uni) => (
                <div key={uni} className="flex flex-col items-center space-y-2 group cursor-pointer">
                  <BookOpen className="text-[#7c3aed] w-10 h-10 group-hover:scale-110 group-hover:text-[#d2bbff] transition-all" />
                  <span className="text-lg font-bold text-white font-heading">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alumni Network CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-16 relative overflow-hidden text-center border-2 border-[#7c3aed]/10 space-y-8">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="bg-[#7c3aed]/20 text-[#d2bbff] px-6 py-2 rounded-full font-bold text-xs tracking-wider uppercase inline-block">
                STAY CONNECTED
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white font-heading">
                Join the Global Network
              </h2>
              <p className="text-[#ccc3d8] text-lg leading-relaxed">
                Reconnect with classmates, mentor current students, and access exclusive professional development opportunities. Your journey with Basaeer doesn't end at graduation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="px-8 py-4 rounded-full text-white font-bold bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
                  Join the Community
                </button>
                <button className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  Update Your Details
                </button>
              </div>
            </div>

            {/* Background Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#adc6ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { 
  Atom, 
  Palette, 
  Trophy, 
  Users, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Binary, 
  MessageSquare,
  Sparkles,
  Award
} from "lucide-react";
import Image from "next/image";

const events = [
  {
    title: "National Science Fair",
    date: "MARCH 2024",
    location: "Main Campus Auditorium",
    description: "Showcasing innovative research projects from students across the region in our state-of-the-art facilities.",
    image: "/placeholder.svg",
  },
  {
    title: "International Quran Competition",
    date: "MAY 2024",
    location: "Tahfeez Center",
    description: "A spiritual gathering of beautiful voices reciting with Tajweed, judged by world-renowned Qaris.",
    image: "/placeholder.svg",
    featured: true,
  },
  {
    title: "Basaer Olympiad",
    date: "OCT 2024",
    location: "Central Stadium",
    description: "Our signature annual sports day featuring track, field, and team sports in a festival atmosphere.",
    image: "/placeholder.svg",
  },
];

const sideTrips = [
  {
    title: "Silicon Valley Tech Tour",
    subtitle: "Innovation & Entrepreneurship",
    image: "/placeholder.svg",
  },
  {
    title: "Amazonian Eco-Research",
    subtitle: "Environmental Sciences",
    image: "/placeholder.svg",
  },
  {
    title: "London Leadership Summit",
    subtitle: "Global Governance",
    image: "/placeholder.svg",
  },
];

const voices = [
  {
    quote: "The Robotics Club didn't just teach me how to build machines; it taught me how to think critically and solve real-world problems with my team.",
    author: "Ahmed Z.",
    meta: "Grade 12, Robotics Lead",
    image: "/placeholder.svg",
    color: "border-primary",
  },
  {
    quote: "Being part of the Leadership Council gave me the confidence to start my own community initiative. Basaer truly empowers us to lead.",
    author: "Sara M.",
    meta: "Grade 11, Council President",
    image: "/placeholder.svg",
    color: "border-primary",
  },
  {
    quote: "Reciting in the International Quran Competition was a life-changing experience. The mentorship here is unparalleled.",
    author: "Omar K.",
    meta: "Grade 10, Tahfeez Member",
    image: "/placeholder.svg",
    color: "border-primary",
  },
];

export default function StudentLifePage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-primary font-bold text-xs tracking-widest uppercase block">
                STUDENT EXPERIENCE
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-none text-text-primary font-heading">
                Beyond the Classroom: Where <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Character</span> is Built.
              </h1>
              <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-xl">
                At Basaer, we cultivate the leaders of tomorrow through a vibrant tapestry of arts, sports, and spiritual growth. Discover your potential in an environment that celebrates every talent.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                  Explore Clubs
                </button>
                <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container backdrop-blur-md border border-border hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  View Calendar
                </button>
              </div>
            </div>

            {/* Collage Section */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Image
                  className="rounded-3xl shadow-2xl aspect-[3/4] object-cover border border-border/50"
                  alt="Students working on collaborative projects"
                  src="/placeholder.svg"
                  width={400}
                  height={533}
                />
                <Image
                  className="rounded-3xl shadow-2xl aspect-square object-cover border border-border/50"
                  alt="Student coding on laptop"
                  src="/placeholder.svg"
                  width={400}
                  height={400}
                />
              </div>
              <div className="space-y-4 pt-8">
                <Image
                  className="rounded-3xl shadow-2xl aspect-square object-cover border border-border/50"
                  alt="Student athlete in action"
                  src="/placeholder.svg"
                  width={400}
                  height={400}
                />
                <Image
                  className="rounded-3xl shadow-2xl aspect-[3/4] object-cover border border-border/50"
                  alt="Students engaged in a leadership seminar"
                  src="/placeholder.svg"
                  width={400}
                  height={533}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Clubs & Societies Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading">
              Clubs &amp; Societies
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Nurture your passions through our diverse range of extracurricular pathways, guided by industry experts and mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-8 h-auto md:h-[600px]">
            {/* Science Club */}
            <div className="md:col-span-2 md:row-span-2 bg-surface-container backdrop-blur-md p-8 rounded-3xl border border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-end relative overflow-hidden group">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                alt="Advanced chemistry laboratory"
                src="/placeholder.svg"
              />
              <div className="relative z-10 space-y-4">
                <Atom className="text-primary w-12 h-12" />
                <h3 className="text-3xl font-bold text-text-primary font-heading">
                  Science Club
                </h3>
                <p className="text-text-secondary text-base leading-relaxed">
                  Exploring the frontiers of robotics, biotechnology, and experimental physics with cutting-edge laboratory facilities.
                </p>
                <button className="text-primary flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:text-text-primary transition-colors">
                  LEARN MORE <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Arts & Calligraphy */}
            <div className="md:col-span-2 bg-surface-container backdrop-blur-md p-8 rounded-3xl border border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex items-center gap-8 group overflow-hidden">
              <div className="flex-1 space-y-3">
                <Palette className="text-primary w-8 h-8" />
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Arts &amp; Calligraphy
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Blending traditional Islamic arts with digital design and modern fine art techniques.
                </p>
              </div>
              <div className="w-1/3 h-full rounded-2xl overflow-hidden border border-border shrink-0 relative">
                <Image
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Traditional Arabic calligraphy"
                  src="/placeholder.svg"
                />
              </div>
            </div>

            {/* Sports Academy */}
            <div className="bg-surface-container backdrop-blur-md p-8 rounded-3xl border border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-center text-center items-center space-y-3 group">
              <Trophy className="text-primary w-12 h-12" />
              <h3 className="text-xl font-bold text-text-primary font-heading">
                Sports Academy
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Elite training in football, tennis, and swimming for national level competition.
              </p>
            </div>

            {/* Leadership Council */}
            <div className="bg-surface-container backdrop-blur-md p-8 rounded-3xl border border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-center text-center items-center space-y-3 group">
              <Users className="text-primary w-12 h-12" />
              <h3 className="text-xl font-bold text-text-primary font-heading">
                Leadership Council
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Empowering the next generation of ethical leaders through civic engagement.
              </p>
            </div>
          </div>
        </section>

        {/* Annual Events Grid */}
        <section className="py-24 bg-surface-container-low mb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight font-heading">
                  Annual Events
                </h2>
                <p className="text-lg text-text-secondary">
                  The highlights of our academic year, where excellence meets celebration.
                </p>
              </div>
              <button className="text-primary font-bold uppercase tracking-wider text-sm border-b border-primary pb-1 hover:text-text-primary transition-colors shrink-0">
                VIEW FULL CALENDAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((evt) => (
                <div
                  key={evt.title}
                  className={`bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border group transition-all duration-300 ${
                    evt.featured 
                      ? "border-primary/50 shadow-[0_0_20px_rgba(0,160,225,0.15)] md:scale-105" 
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={evt.title}
                      src={evt.image}
                    />
                    <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded font-bold text-[10px] text-text-primary tracking-widest uppercase">
                      {evt.date}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h4 className="text-xl font-bold text-text-primary font-heading group-hover:text-primary transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {evt.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary font-semibold pt-2 border-t border-border/50">
                      <MapPin size={14} /> {evt.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Excursions & Field Trips */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-text-primary font-heading mb-16">
            Global Explorations
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-surface-container backdrop-blur-md p-4 rounded-3xl relative group overflow-hidden border border-border flex flex-col justify-end min-h-[400px]">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                alt="Students exploring historic Istanbul"
                src="/placeholder.svg"
              />
              <div className="relative z-10 p-6 space-y-3">
                <div className="text-primary font-bold text-xs tracking-widest uppercase">
                  UPCOMING
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-text-primary font-heading">
                  Istanbul: History &amp; Heritage
                </h4>
                <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                  An immersive 10-day journey through the Ottoman history and modern architectural wonders of Turkey.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-4">
              {sideTrips.map((trip) => (
                <div 
                  key={trip.title}
                  className="bg-surface-container backdrop-blur-md p-4 rounded-2xl flex gap-4 items-center group cursor-pointer border border-border hover:border-primary/30 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border/50">
                    <Image className="object-cover" alt={trip.title} src={trip.image} width={96} height={96} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-base font-bold text-text-primary font-heading">
                      {trip.title}
                    </h5>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                      {trip.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Voices */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-text-primary font-heading mb-16">
            Student Voices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {voices.map((v) => (
              <div 
                key={v.author} 
                className={`bg-surface-container backdrop-blur-md p-8 rounded-3xl relative border-t-4 ${v.color} border-l border-r border-b border-border/50 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between`}
              >
                <p className="text-lg italic text-text-primary leading-relaxed mb-8">
                  &quot;{v.quote}&quot;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/50 shrink-0">
                    <Image className="object-cover" alt={v.author} src={v.image} width={48} height={48} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-text-primary font-heading">{v.author}</div>
                    <div className="text-xs text-text-secondary font-semibold">{v.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  TrendingUp,
  Sparkles, 
  Lightbulb, 
  ChevronRight, 
  BookOpen, 
  Compass, 
  MapPin, 
  Briefcase, 
  UserCheck, 
  Quote 
} from "lucide-react";

const categories = ["ALL", "ACADEMIC", "ADMINISTRATIVE", "TAHFEEZ"];

const vacancyList = [
  {
    id: 1,
    type: "ACADEMIC",
    campus: "Riyadh Campus",
    title: "Head of Science Department",
    desc: "Full-time • 5+ Years Experience • Competitive Package",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    type: "TAHFEEZ",
    campus: "Jeddah Campus",
    title: "Senior Quran Instructor",
    desc: "Full-time • Ijazah Required • On-campus Housing",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    id: 3,
    type: "ADMINISTRATIVE",
    campus: "Central Admin",
    title: "Admissions Coordinator",
    desc: "Full-time • Excellent Communication • Riyadh",
    badgeColor: "bg-surface-container text-text-secondary",
  },
];

const testimonials = [
  {
    quote: "Teaching at Basaer isn't just a job; it's a spiritual calling. The blend of high-tech tools with traditional values allows me to reach students in ways I never thought possible.",
    author: "Dr. Omar Al-Fayed",
    role: "Head of Humanities",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsOjRTsylVCK56UdKbFlMbXQvDQ-42jht0K6ytcuQkSHQTYluLmDUjcdKdxQTjXf0-gIZVIljana-g3sTCeyIAKce0g87btCPM0oUWPaYq9dCbE0OOFK3y9GWaMuX2Dto297_q4opF4PUK2Cbsh7aryu_IbYFPIzwOV4s0sQ6VPbyU10_HG2KlGqwnw0XObftJBpcABDLHHP-9g7NAH_vqIo0X9ged5i8YAWZgJij2R8ntMiqXg3Aw2B1eodS9DihtWMCL0-fTykw",
  },
  {
    quote: "The school's commitment to our professional growth is unmatched. I’ve attended two international workshops this year alone, and the support from leadership is truly inspiring.",
    author: "Sarah Mansour",
    role: "Senior Mathematics Teacher",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGNjZbAnv6BB7ldLCvj5RnQTQBsgRxQ4UTLg9aVdSgDIwiq89YIgrZHJ8A-rgjoDdQh3TpEmjLLYl4VRJuh7EaSRk0WZKoMxgPVZAcz202G87fva8OJSUj0u53AoVLBEPgWxv_u1C919T7xPxP19TMlNU4miolU5yPPVEIefTIqClrrd-gzjg7y64uRO16a1NPX43ZfSEZxoMgi9tujLtdtzaEQY5Oj-IJe6Zaicg90Y4seULJRNqvtbEqbwwUVwKa-u3IPX3i63E",
  },
];

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredJobs = vacancyList.filter(
    (job) => activeTab === "ALL" || job.type === activeTab
  );

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 z-0">
            <Image fill sizes="100vw" className="object-cover opacity-25 scale-105" alt="Futuristic Islamic School majestic corridor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyRxXBRuCCf1e0zhfXVlae2I8RDkFAo7_FxfmBrWaspVAuojt2PUs8twGMMQUck0N3PTQCqpCp9FWxT31006iP69hq64AcNF0k3nfY92J0ftWTcGQ2olVaTFQczTS4Ci0HDHTF7mN--h9dz7zmnn1UN2IKUxA-w7AFdzreRZY5WLyAcAv4Tf-gHd-WVUcIF4led1j3hf9TvcGthu0mZHgnZ0XolS-qq-N_jxBVc2KjhOqvc9pfrC0igPF9ree8hEdTKxHSEaWhC3k" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block">
              CAREERS AT BASAER
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Join the Mission: <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)] block md:inline">Shape the Future of Leadership.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              We are seeking visionary educators and administrators dedicated to nurturing the next generation of leaders through spiritual depth and academic excellence.
            </p>
            <div className="pt-4">
              <a 
                href="#openings" 
                className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300 inline-block"
              >
                View Openings
              </a>
            </div>
          </div>
        </section>

        {/* Why Teach at Basaer */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
              Why Teach at Basaer?
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Professional Growth */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-500 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Professional Growth
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Continuous development programs and international certifications to ensure our faculty remains at the cutting edge of pedagogy.
                </p>
              </div>
            </div>

            {/* Spiritual Environment */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-500 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Spiritual Environment
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  A holistic workplace that integrates faith-based values with daily routines, fostering a tranquil and purposeful atmosphere.
                </p>
              </div>
            </div>

            {/* Innovation in Education */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-500 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Innovation in Education
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  State-of-the-art facilities and digital tools that empower teachers to create immersive and interactive learning experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Vacancies */}
        <section id="openings" className="py-24 bg-surface-container-low mb-16 border-t border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight font-heading">
                  Current Vacancies
                </h2>
                <p className="text-lg text-text-secondary">
                  Find your place in our growing family.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                      activeTab === cat
                        ? "bg-primary text-white shadow-[0_0_15px_rgba(0,160,225,0.4)]"
                        : "bg-surface-container text-text-secondary hover:text-white hover:bg-white/10 border border-border/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    key={job.id}
                    className="bg-surface-container backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-border hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary`}>
                          {job.type}
                        </span>
                        <span className="text-text-secondary text-xs font-medium flex items-center gap-1">
                          <MapPin size={12} /> {job.campus}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-text-primary font-heading">
                        {job.title}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {job.desc}
                      </p>
                    </div>
                    <button className="text-primary font-bold flex items-center gap-1.5 hover:text-white transition-colors group shrink-0 w-full md:w-auto justify-end">
                      Learn More <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Application Journey */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 mb-16">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
              Application Journey
            </h2>
            <p className="text-lg text-text-secondary">
              Simple steps to joining our faculty
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center space-y-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl font-bold font-heading mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,160,225,0.15)]">
                1
              </div>
              <h5 className="text-lg font-bold text-text-primary font-heading">
                Submit Online
              </h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                Complete our digital portal application with your CV and portfolio.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl font-bold font-heading mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,160,225,0.15)]">
                2
              </div>
              <h5 className="text-lg font-bold text-text-primary font-heading">
                Initial Screening
              </h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                Our HR team reviews your qualifications and spiritual alignment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl font-bold font-heading mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,160,225,0.15)]">
                3
              </div>
              <h5 className="text-lg font-bold text-text-primary font-heading">
                Panel Interview
              </h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                Meet the department heads and showcase your vision for education.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl font-bold font-heading mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,160,225,0.15)]">
                4
              </div>
              <h5 className="text-lg font-bold text-text-primary font-heading">
                Welcome Onboard
              </h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                Receive your offer and begin your orientation with the Basaer family.
              </p>
            </div>
          </div>
        </section>

        {/* Voice of the Faculty */}
        <section className="py-24 bg-surface-container-low mb-16 border-t border-b border-border/50 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-primary/10 rounded-full blur-[80px] z-0"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-center font-heading mb-16">
              Voice of the Faculty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((test) => (
                <div key={test.author} className="bg-surface-container border border-border p-8 rounded-3xl relative flex flex-col justify-between">
                  <Quote className="text-primary/20 absolute top-6 right-6" size={60} />
                  <p className="text-lg italic text-text-primary mb-8 leading-relaxed">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <Image width={56} height={56} className="rounded-full object-cover border-2 border-primary" alt={test.author} src={test.image} />
                    <div>
                      <h6 className="font-bold text-text-primary font-heading">
                        {test.author}
                      </h6>
                      <p className="text-xs text-text-secondary">
                        {test.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-8 mb-24">
          <div className="bg-surface-container backdrop-blur-md rounded-[40px] p-8 md:p-16 text-center border-2 border-primary/10 relative overflow-hidden space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading relative z-10">
              Ready to make an impact?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto relative z-10">
              If you don't see a position that fits your profile but share our vision, we'd still love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 relative z-10">
              <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                Send General Application
              </button>
              <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container border border-border hover:bg-white/10 hover:scale-105 transition-all duration-300">
                Explore Campuses
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

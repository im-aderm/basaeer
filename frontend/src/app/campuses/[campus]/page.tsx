"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, MapPin, BookOpen, Users, Calendar, Award,
  GraduationCap, CheckCircle, Sparkles
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { campuses, sections, campusImages, campusDescriptions, campusFeatures, campusHighlights } from "@/lib/school-data";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, BookOpen, Calendar, Award, Heart: Sparkles, Users,
};

export default function CampusPage({ params }: { params: Promise<{ campus: string }> }) {
  const { campus: campusSlug } = React.use(params);
  const campus = campuses.find((c) => c.slug === campusSlug);
  if (!campus) notFound();

  const img = campusImages[campus.slug];
  const features = campusFeatures[campus.slug] ?? [];
  const highlights = campusHighlights[campus.slug] ?? [];

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20">
      <GradientBackground />
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[85vh] flex items-center pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src={img} alt={`${campus.name} Campus`} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> {campus.tagline}
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary font-heading leading-tight">
                {campus.name} Campus
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
                {campusDescriptions[campus.slug]}
              </p>
              {/* Stats row */}
              <div className="flex flex-wrap gap-8 pt-4">
                {features.map((f) => {
                  const Icon = iconMap[f.icon] ?? Sparkles;
                  return (
                    <div key={f.label} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-text-primary font-heading">{f.value}</div>
                        <div className="text-xs text-text-secondary font-medium uppercase tracking-wider">{f.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Why Choose {campus.name}</span>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading leading-tight">
                A Campus Built for <span className="text-primary">Excellence</span>
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {campusDescriptions[campus.slug]}
              </p>
              <ul className="space-y-4 pt-2">
                {highlights.slice(0, 4).map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-3xl overflow-hidden border border-border shadow-2xl"
            >
              <Image src={img} alt={`${campus.name} Campus`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-text-primary font-heading">{campus.name}</p>
                      <p className="text-xs text-text-secondary">{campus.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Academic Sections ── */}
        <section className="py-24 bg-surface-container-low/50 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Our Programs</span>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">Academic Sections</h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Explore the programs offered at our {campus.name} campus
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, i) => (
                <motion.div
                  key={section.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/campuses/${campus.slug}/${section.slug}`}
                    className="group block bg-surface-container border border-border rounded-3xl p-8 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    <div className="space-y-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <BookOpen className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary font-heading group-hover:text-primary transition-colors">
                          {section.name}
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed mt-2">{section.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm pt-2 border-t border-border/50">
                        Explore Program <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── All Highlights ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="bg-gradient-to-br from-primary/5 via-secondary/[0.02] to-transparent rounded-[40px] p-8 md:p-16 border border-border/50">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Campus Features</span>
                <h3 className="text-3xl md:text-4xl font-bold text-text-primary font-heading">
                  Everything You Need to <span className="text-primary">Thrive</span>
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  From state-of-the-art facilities to dedicated mentorship, our {campus.name} campus provides an environment where students excel academically, spiritually, and socially.
                </p>
              </div>
              <div className="space-y-5">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{h}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <GraduationCap className="w-14 h-14 text-white/80 mx-auto" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-white font-heading">
                Begin Your Journey at {campus.name}
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
                Join a community dedicated to academic excellence, spiritual growth, and holistic development.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  href="/admission"
                  className="px-8 py-4 rounded-full bg-white text-primary font-bold hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 shadow-xl"
                >
                  Apply Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/campuses"
                  className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Explore All Campuses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, MapPin, CheckCircle, GraduationCap, Clock, Users,
  ArrowRight, Target, Sparkles, BookMarked
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import {
  campuses, sections, campusImages, sectionImages,
  campusDescriptions, sectionDetails
} from "@/lib/school-data";

export default function SectionPage({ params }: { params: Promise<{ campus: string; section: string }> }) {
  const { campus: campusSlug, section: sectionSlug } = React.use(params);
  const campus = campuses.find((c) => c.slug === campusSlug);
  const section = sections.find((s) => s.slug === sectionSlug);
  if (!campus || !section) notFound();

  const details = sectionDetails[section.slug];
  if (!details) notFound();

  const campusImg = campusImages[campus.slug];
  const sectionImg = sectionImages[section.slug];

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20">
      <GradientBackground />
      <Navbar />

      <main>
        {/* ── Breadcrumb ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/campuses" className="hover:text-primary transition-colors">Campuses</Link>
            <span>/</span>
            <Link href={`/campuses/${campus.slug}`} className="hover:text-primary transition-colors">{campus.name}</Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">{section.name}</span>
          </div>
        </section>

        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Link
                href={`/campuses/${campus.slug}`}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to {campus.name} Campus
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> {campus.name} Campus
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary font-heading leading-tight">
                {section.name}
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed">{section.description}</p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{details.ageRange}</div>
                    <div className="text-xs">Age Range</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{details.duration}</div>
                    <div className="text-xs">Duration</div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[400px] rounded-3xl overflow-hidden border border-border shadow-2xl"
            >
              <Image src={sectionImg} alt={section.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl p-5 border border-border flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-text-primary font-heading">{section.name} Program</p>
                    <p className="text-xs text-text-secondary">{campus.name} Campus</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {details.highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface-container border border-border rounded-2xl p-6 hover:border-primary/60 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-text-primary font-semibold leading-relaxed">{h}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Curriculum & Outcomes ── */}
        <section className="py-20 bg-surface-container-low/50 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Curriculum */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">What We Teach</span>
                  <h2 className="text-3xl font-bold text-text-primary font-heading">Curriculum Overview</h2>
                  <p className="text-text-secondary leading-relaxed">
                    Our {section.name.toLowerCase()} curriculum at {campus.name} is designed to provide a comprehensive education that balances academic rigor with spiritual development.
                  </p>
                </div>
                <div className="space-y-4">
                  {details.curriculum.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-border/50 hover:border-primary/60 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <BookMarked className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{item.split(" — ")[0]}</p>
                        {item.includes(" — ") && (
                          <p className="text-sm text-text-secondary mt-0.5">{item.split(" — ")[1]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Outcomes */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">What You Achieve</span>
                  <h2 className="text-3xl font-bold text-text-primary font-heading">Learning Outcomes</h2>
                  <p className="text-text-secondary leading-relaxed">
                    Upon completion of the {section.name.toLowerCase()} program, students will have developed the following competencies and achievements.
                  </p>
                </div>
                <div className="space-y-4">
                  {details.outcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-border/50 hover:border-primary/60 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-semibold text-text-primary">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Campus Context ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-3xl overflow-hidden border border-border shadow-xl order-2 md:order-1"
            >
              <Image src={campusImg} alt={`${campus.name} Campus`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl p-5 border border-border">
                  <p className="font-bold text-text-primary font-heading flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> {campus.name} Campus
                  </p>
                  <p className="text-sm text-text-secondary mt-1">{campusDescriptions[campus.slug].slice(0, 100)}...</p>
                </div>
              </div>
            </motion.div>
            <div className="space-y-6 order-1 md:order-2">
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Why {campus.name}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-heading leading-tight">
                {section.name} at <span className="text-primary">{campus.name}</span>
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our {campus.name} campus offers an ideal environment for the {section.name.toLowerCase()} program, combining modern facilities with a supportive community dedicated to student success.
              </p>
              <Link
                href={`/campuses/${campus.slug}`}
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                Learn more about {campus.name} Campus <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <GraduationCap className="w-14 h-14 text-white/80 mx-auto" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-white font-heading">
                Start Your {section.name} Journey
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
                Join our {section.name.toLowerCase()} program at {campus.name} and become part of a community dedicated to excellence.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  href="/admission"
                  className="px-8 py-4 rounded-full bg-white text-primary font-bold hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 shadow-xl"
                >
                  Apply Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={`/campuses/${campus.slug}`}
                  className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Explore {campus.name} Campus
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

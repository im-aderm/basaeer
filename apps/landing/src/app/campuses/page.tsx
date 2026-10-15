"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Users, BookOpen } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { campuses, sections, campusImages, campusDescriptions } from "@/lib/school-data";

export default function CampusesPage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      <GradientBackground />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
          <div className="space-y-6 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
              VISIONARY EDUCATION
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary font-heading leading-tight">
              Our Campuses
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Discover our strategically located campuses across Northern Nigeria, each designed to provide a serene, technology-rich environment for academic excellence and spiritual growth.
            </p>
          </div>
        </section>

        {/* Campus Cards */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campuses.map((campus, i) => (
              <motion.div
                key={campus.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/campuses/${campus.slug}`}
                  className="block bg-surface-container border border-border rounded-3xl overflow-hidden group hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={campusImages[campus.slug]}
                      alt={`${campus.name} Campus`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-text-primary font-heading">{campus.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">{campus.tagline}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{campus.students} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        View Sections <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {sections.map((s) => (
                        <span
                          key={s.slug}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Overview Table */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="bg-surface-container border border-border rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-heading mb-8">Campus Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {campuses.map((campus) => (
                <Link
                  key={campus.slug}
                  href={`/campuses/${campus.slug}`}
                  className="p-6 rounded-2xl border border-border hover:border-primary/60 hover:bg-surface-container-high transition-all duration-300 space-y-3"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-text-primary font-heading">{campus.name}</h4>
                  <p className="text-sm text-text-secondary">{campus.tagline}</p>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Users className="w-3.5 h-3.5" />
                    <span>{campus.students}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

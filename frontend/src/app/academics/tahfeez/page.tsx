"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, BookOpen, Star, Award, Shield, Users, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { cn } from "@/lib/utils";

export default function TahfeezPage() {
  const pathStages = [
    {
      num: "01",
      title: "An-Nazirah",
      subtitle: "Perfecting the Gaze",
      desc: "Students master the art of reading directly from the Mushaf with Tajweed rules application and proper Makharij (articulation points).",
    },
    {
      num: "02",
      title: "Al-Hifz",
      subtitle: "Systematic Memorization",
      desc: "A tailored pace for each student, focusing on retention strength through daily Sabaq (new lesson), Sabqi (recent lessons), and Manzil (old review).",
    },
    {
      num: "03",
      title: "Al-Itqan",
      subtitle: "Ijazah & Perfection",
      desc: "The final phase where students consolidate the entire Quran, leading to public examinations and the awarding of a Sanad (connected chain of narration).",
    },
  ];

  const faculty = [
    {
      name: "Sheikh Ahmad Al-Mansour",
      role: "Head of Tahfeez | Ijazah in 10 Qira’at",
      desc: "Over 25 years of teaching experience in Al-Azhar, specializing in Varsh and Hafs recitations.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgjSKNrHD4UG1lxm5k-LrDLi8gjXkMdN0NVtt7Up4aIJ3SItrrz_aty3cOrScOP1vIJnj14qnOiraHyKYSYMMaLhsOlGhpjeDmBBajR6KSDMtZAPepLcrziU5Lfbjps7OKHjHayWbIM0E8y84pjpWoM5wBPKVC-wLOc5Y5_Jtwn_ZeuarBSfCyV9I832R87UewZl9-nBc_dmnHYo29_iJMIbMp4fGQN-Ijzl8xyiUWhy--KE45mKy8EhL9_v0WeYwLR-BiO11Oc48",
    },
    {
      name: "Ustadh Omar Farooq",
      role: "Master of Tajweed & Phonetics",
      desc: "Renowned for his precision in Arabic phonetics and innovative memorization techniques for youth.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzcdQBahNTIH1UV_udmsLlFQu_1gLzTFiOs1ySA9dRYN6zB6nYrbfVafICxqWwxGiK2Djk3JbUeOxtM0d4fSCLaEMM--ldowCtUG-_PrAsfXsyQirdhzjapBwG0nSk-DBqLS644GGYjgwe1e1YCgqhsfZMTqikZ7VHNJHPyULIm_iy9mOWDK3z6jyxYI_EAfKiutCyZHuVvJ6Mv54AOGgCHhaLcKWEz2zJQky8J0M9PduAe2fEmdsZSRhLtR_xj-2bJGWOQ2L5u_M",
    },
    {
      name: "Hafiz Khalid Ibrahim",
      role: "Student Support Specialist",
      desc: "Focuses on psychological well-being and motivational coaching for students in the final Hifz stages.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVDPBDHli2v171YqmyLYy4I2GE4sLXZSxx3IE7S9E75j-h4pBnf-ewP5zfAKr2bYAfH5IoBm6gg8hbWOicLXmDKdDnGX84pHvy0AcWYxq7_D4uOriwNT5hyNnYhZ1rVU9VEwwb6GWW0JqCGILPjP7zz5BTiGaWTj2YCFWMLLj0JLEdbRtX4hNvxRZLoNimW2uxyz76gD9uuccFBVNgMOkN_M-aj0RwAbdc5Cw79-lmFSY5kCAmGs70eESXZv9RTczgn0iR0rXTSLw",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      <GradientBackground />
      <Navbar />

      <main className="pt-24">
        {/* Hero Header */}
        <section className="relative py-20 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
          </div>

          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent-gold text-xs font-semibold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-accent-gold" /> Nourishing the Soul
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-tight">
              The Journey of Light: <br />
              <span className="text-gradient-primary">Quran Memorization Academy</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Embark on a transformative spiritual odyssey where ancient wisdom meets modern pedagogical excellence. Basaeer’s Tahfeez Academy nurtures the next generation of Hifz guardians within a sanctuary of light and peace.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link href="/admission/apply/1" className="btn-premium-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Start the Journey
              </Link>
              <button className="btn-premium-secondary px-8 py-3.5 text-sm font-semibold hover:scale-105 active:scale-95 transition-all">
                Download Syllabus
              </button>
            </div>
          </div>

          {/* Calligraphy Cinematic Asset */}
          <div className="mt-16 relative w-full max-w-4xl mx-auto">
            <GlassCard className="rounded-[40px] p-2 overflow-hidden relative group bg-background/25" hoverEffect="glow">
              <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC79A27lEAaQ5bYKFkbrYNecvWV65bEhyQiI4HnMidRYR5EspKAAKmWuR24gq1IH_gHiPtGLsdJfjtQawkp3kVCJs1USdmZV-jDQPzs7SUBtP-yXy0cGEkgsERkCIKh22PQJsCnET5JskB-b6rq15LoyjmY6HrDiLOX8EhLXk77SVfCybQsaXFRVuWYX68nxz2PjypKarxGaxPh5jEu6TH9BLyzNw-rjDxXTigY8eiYvx6NnDngTvKqB6hzpoEP4EHQoBIZ-c5JqgQ"
                  alt="Sacred Calligraphy"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-left space-y-1">
                  <p className="text-accent-gold font-heading font-extrabold text-2xl lg:text-3xl text-glow">
                    &quot;Indeed, We have sent down the Quran...&quot;
                  </p>
                  <p className="text-text-secondary/80 text-xs uppercase tracking-wider font-semibold">
                    Surah Al-Hijr 15:9
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Memorization Path (Timeline) */}
        <section className="py-20 px-6 max-w-7xl mx-auto relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
              The Memorization Path
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="relative space-y-12">
            {/* Center connector line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 hidden md:block" />

            {pathStages.map((stage, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-8 relative",
                  idx % 2 !== 0 && "md:flex-row-reverse"
                )}
              >
                {/* Visual side block */}
                <div className={cn("md:w-1/2 hidden md:block", idx % 2 === 0 ? "text-right" : "text-left")}>
                  <h3 className="text-3xl font-heading font-extrabold text-primary">{stage.title}</h3>
                  <p className="text-text-secondary font-medium text-sm mt-1">{stage.subtitle}</p>
                </div>

                {/* Bullet badge */}
                <div className="z-10 w-12 h-12 rounded-full bg-surface-container border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)] shrink-0 font-bold text-primary">
                  {stage.num}
                </div>

                {/* Floating card */}
                <div className="md:w-1/2 w-full">
                  <GlassCard className="p-8 rounded-3xl bg-background/30 border border-border" hoverEffect="glow">
                    <h3 className="text-2xl font-heading font-extrabold text-primary md:hidden">{stage.title}</h3>
                    <p className="text-accent-gold font-bold text-xs uppercase tracking-wider mb-2 md:hidden">{stage.subtitle}</p>
                    <p className="font-semibold text-text-primary mb-2">Perfecting the Path</p>
                    <p className="text-text-secondary text-sm font-semibold leading-relaxed">
                      {stage.desc}
                    </p>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Distinguished Faculty */}
        <section className="py-20 bg-surface-container/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-2 text-left">
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Guardians</span>
                <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
                  Distinguished Faculty
                </h2>
              </div>
              <p className="text-text-secondary text-sm font-semibold max-w-md text-left">
                Our scholars are not just teachers; they are mentors with chains of narration (Sanad) connecting back to the Prophet (PBUH).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {faculty.map((member, idx) => (
                <GlassCard key={idx} className="rounded-3xl overflow-hidden bg-background/25 border border-border p-2" hoverEffect="glow">
                  <div className="h-80 relative rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={member.img}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>
                  <div className="px-4 pb-6 text-left space-y-2">
                    <h4 className="text-xl font-heading font-extrabold text-primary">{member.name}</h4>
                    <p className="text-accent-gold text-[10px] font-bold uppercase tracking-wider">{member.role}</p>
                    <p className="text-text-secondary text-xs font-semibold leading-relaxed">{member.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Fruits of the Journey (Gallery Bento Grid) */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
              Fruits of the Journey
            </h2>
            <p className="text-text-secondary font-semibold">Celebrating the milestones and graduations of our brilliant Huffaz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[600px]">
            {/* Big Bento Left */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden border border-border group h-80 md:h-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI5vXnURl8z4Ui43scCvIpP2eFOjBnhgluGN7klMvFz7VMMXqvNxHxN5oV_-RcJtvh15lXYHYyHcnyWyT7fmsuPmBODTdtFF61H_q-eD-Czg7rdEjwjQmVX26cCJZLsJCnxtzbjp8XOzNLFB3KIQSdK7Y5_v7KLfOxhf-uqmtJPQ8xHXiVQB91h50_u0IaE5vE4NmPT9p3NKhQPAv2SL7cnB9941AcrpyZ57E35WPqtC2UHjjBi0bRmP-YrTjxc0LGzyr4ynZLoTk"
                alt="Crown of Light Ceremony"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-left">
                <span className="text-accent-gold text-xs font-bold uppercase tracking-wider">Class of 2023</span>
                <h3 className="text-2xl font-heading font-extrabold text-white">Annual Crown of Light Ceremony</h3>
              </div>
            </div>

            {/* Medium Bento Right Top */}
            <div className="md:col-span-2 relative rounded-3xl overflow-hidden border border-border group h-60 md:h-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCToiMkHtSFKQw-vRilIpIhbQydh_88iG16wUeV2-H3MMNPzd-VOQI3zUCH5jGgNdMe6nHnwcCyERJ7WB0W5DVTRz44DOcuVep7AKVzNICHFvP12vz1jJZSkvMc1O2JDI7FJS6wyCaj2TyY16A2Hi1-YdA1WGmSR0sMV4JcO1osaWeHI5LeClvxTjbxqddiN2rJbhxKaKlvVTmilmum4pgOwJMCrx8tn3l9SkyZCwLb1PvSKtBCnzbFic5PMO3LqAFPGLQwhT-q3OA"
                alt="Modern Learning Spaces"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
                <h4 className="text-lg font-bold text-white">Modern Learning Spaces</h4>
              </div>
            </div>

            {/* Small Bento 1 */}
            <div className="relative rounded-3xl overflow-hidden border border-border group h-60 md:h-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFxdkPVdwyc7-a6EYkIytKvuR6GUeeV4kJ0ffi7DgqRu1HEtOwHAoloGklWb9s1QBPoz8EkEh7ikTPNJ50ems69CtY4tWlndLmBAWOarp6RQ-C-STCWZZaOC9qySAxPHZbe207yIhUkyHYTiEQsIr9YcLM1HMG5-7qQnLertnsq8H09SESu45OOJTh5pk2pLDnJt_3JXn75iMBpvWAtSBfE179kuMp73jxhzITFh2Xs9NgXBSnpRuooxcDGshxDUXpxARkslgsWtc"
                alt="Tajweed Close-up"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                unoptimized
              />
            </div>

            {/* Small Bento 2 */}
            <div className="relative rounded-3xl overflow-hidden border border-border group h-60 md:h-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Yxw0eVOg2p0NgVettEVEaBK1o3CVZ7wniZbw51GDFu6_dERJ3ovKeb7AvYKs7x_aNy-wMGExCKSiG53gg9tgysD9qY_kTuacPdT7swkUPA2nFSUsssvstX8DFV5nsPRjDlDklvpgDUWL8VOo-WqYc4NGs8uRCf24MRyf87h7591wqizA15LiBJgDE7W4N4ceC9i8cONyvHkDIrf-2dG8SE3aaiIQLXAUOZ7U5wYmugkvu8Z8kse1RzsDG7tHpk_nJXhBJZODYPg"
                alt="Smiling Students"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 max-w-4xl mx-auto px-6 text-center relative">
          <div className="glass-panel rounded-[40px] p-12 border-primary/20 bg-background/25 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-gold/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[80px] rounded-full" />

            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-text-primary">
              Ready to Begin the Journey?
            </h2>
            <p className="text-text-secondary text-sm font-semibold leading-relaxed max-w-xl mx-auto">
              Admissions for the upcoming semester are now open. Secure a place for your child in an environment that prioritizes both worldly excellence and spiritual depth.
            </p>

            <Link href="/admission/apply/1" className="inline-block bg-primary hover:bg-primary-light text-white font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-all cursor-pointer">
              Inquire for Admission
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Licensed Academy</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> 1:15 Teacher Ratio</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

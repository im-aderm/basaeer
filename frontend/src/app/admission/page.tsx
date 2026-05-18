"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Clock,
  GraduationCap,
} from "lucide-react";

const steps = [
  {
    title: "Online Application",
    description:
      "Complete the application form online at basaerschools.com.ng. After online submission, collect and submit the manual application form from our administrators.",
    icon: FileText,
  },
  {
    title: "Document Upload",
    description:
      "Upload scanned copies of all required documents: NIN, birth certificate, medical records, passport photographs, educational certificates, and recommendation letter from your Imam or Islamic teacher.",
    icon: ClipboardCheck,
  },
  {
    title: "Entrance Assessment",
    description:
      "Applicants undergo assessment including Qur'an recitation (Surah Al-Fatihah + minimum 2 Hizb fluently), English placement test (minimum 60% for BQSC), and written tests in Mathematics and Science.",
    icon: BookOpen,
  },
  {
    title: "Interview & Admission",
    description:
      "Successful candidates proceed to interview. Upon acceptance, complete enrollment by submitting verified documents and paying applicable fees.",
    icon: CheckCircle2,
  },
];

const documents = [
  "National Identification Number (NIN)",
  "Birth Certificate (digital upload PDF/Image)",
  "Medical Record (mandatory test results)",
  "Two passport photographs (white background)",
  "Educational certificates (previous school reports)",
  "Recommendation letter from Imam/Islamic teacher",
  "Application fee payment receipt (₦10,000 non-refundable)",
];

const requirements = [
  {
    title: "BQMS Day Programs",
    items: [
      "Boys and girls ages 5–25",
      "Ability to recite Qur'an at basic level",
      "Commitment to regular attendance",
    ],
  },
  {
    title: "BQMS Boarding (Boys)",
    items: [
      "Boys ages 12–25",
      "Minimum 2 Hizb Qur'an memorization recommended",
      "Vaccination records (meningitis, hepatitis B)",
      "Medical certificate confirming fitness for boarding",
    ],
  },
  {
    title: "BQSC Girls Boarding College",
    items: [
      "Girls ages 12–16",
      "Completed Primary 6 or JSS1 with verified school reports",
      "No history of disciplinary issues",
      "Minimum 60% in English placement test",
      "Arabic reading ability preferred but not mandatory",
    ],
  },
];

const rejectionGrounds = [
  "False information on application",
  "Failure to pass entrance exams or interview",
  "Refusal to comply with health or disciplinary policies",
  "Incomplete documentation",
];

export default function AdmissionPage() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      <GradientBackground />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase">
              Admissions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading mt-4 leading-tight">
              Begin Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-emerald">
                Journey of Light
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mt-4 max-w-2xl">
              Join a transformative educational experience where Qur&apos;anic mastery
              meets academic excellence. Applications are open year-round for day and
              boarding programs across our campuses in Kaduna, Kano, Bauchi, and
              Plateau States.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/admission/apply"
                className="px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors inline-flex items-center gap-2 shadow-lg shadow-primary/25"
              >
                Apply Online
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-full glass-card text-primary font-bold text-sm hover:bg-surface-container/20 transition-all inline-flex items-center gap-2"
              >
                Contact Admissions
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Application Process */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-center mb-12">
            Application Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl p-6 relative"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mb-4">
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <step.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-bold font-heading mb-2">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Eligibility */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-center mb-12">
            Eligibility Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requirements.map((req, i) => (
              <motion.div
                key={req.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={18} className="text-primary" />
                  <h3 className="font-bold font-heading text-sm">{req.title}</h3>
                </div>
                <ul className="space-y-2">
                  {req.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-text-secondary flex items-start gap-2"
                    >
                      <CheckCircle2
                        size={12}
                        className="text-accent-emerald shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Required Documents */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading mb-8">
              Required Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fees & Grounds */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-primary" />
              <h3 className="font-bold font-heading text-lg">Fees & Payment</h3>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                Application fee: <strong>₦10,000</strong> (non-refundable, paid online)
              </li>
              <li>
                Tuition fees, payment schedules, and additional charges will be
                communicated to parents/guardians upon acceptance.
              </li>
              <li>
                Information on scholarships or financial aid (if available) will be
                provided.
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="font-bold font-heading text-lg">
                Grounds for Rejection
              </h3>
            </div>
            <ul className="space-y-3">
              {rejectionGrounds.map((item) => (
                <li
                  key={item}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-red-400 shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading mb-4">
              Ready to Apply?
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-6">
              Take the first step toward a transformative Qur&apos;anic education.
              Complete your application online today.
            </p>
            <Link
              href="/admission/apply"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-lg shadow-primary/25"
            >
              Start Application <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

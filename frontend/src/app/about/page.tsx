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
  Users,
  BookOpen,
} from "lucide-react";

const values = [
  {
    title: "Quality",
    description:
      "Maintaining high standards in every aspect of education and administration.",
    icon: Award,
  },
  {
    title: "Excellence",
    description:
      "Striving for outstanding achievement in Qur'anic, academic, and personal development.",
    icon: Sparkles,
  },
  {
    title: "Integrity & Transparency",
    description:
      "Operating with honesty, openness, and accountability in all dealings.",
    icon: ShieldCheck,
  },
  {
    title: "Innovation",
    description:
      "Embracing modern teaching methods and technology to enhance learning.",
    icon: Lightbulb,
  },
  {
    title: "Teamwork",
    description:
      "Fostering collaboration among students, teachers, and parents.",
    icon: Users,
  },
  {
    title: "Knowledge Sharing",
    description:
      "Spreading beneficial knowledge within and beyond our community.",
    icon: BookOpen,
  },
];

const timeline = [
  {
    year: "2021",
    title: "Foundation",
    description:
      "Basa'er began on 22 September 2021 as a humble family initiative at EE13 Ramat Close B, Unguwar Rimi, Kaduna State, with 24 students from just five families.",
  },
  {
    year: "2021–2022",
    title: "Expansion to Three States",
    description:
      "Within its first academic year, the institution expanded rapidly — establishing branches in Bauchi State, Kano State, and Plateau State, reaching underserved communities across northern Nigeria.",
  },
  {
    year: "2024",
    title: "Boarding Programs Launched",
    description:
      "Launched the first boys boarding school (two-year Tahfeez program) in Kano State, followed by the girls-only Basa'er Qur'anic & Science College (BQSC) at the Kaduna Headquarters.",
  },
  {
    year: "Present",
    title: "Growing Nationwide",
    description:
      "Operating two major campuses for boys in Kano State and a flagship campus for girls in Kaduna State. Arrayyan Learning Centre (ALC) established in Bauchi for nursery, primary, and secondary education.",
  },
];

const leadership = [
  {
    name: "Assoc. Prof. Imam Muhammad Suleiman Adam",
    role: "Founder",
    description:
      "Chief Imam of Sultan Bello Mosque, Kaduna. A visionary Islamic scholar and academic dedicated to raising a Qur'an-centric generation.",
  },
  {
    name: "Dr. Abubakar Muhammad Abubakar",
    role: "Co-Founder",
    description:
      "Director of Alfurqan Kano. Committed to expanding Qur'anic education to underserved communities across northern Nigeria.",
  },
  {
    name: "Ustaz Hisham Muhammad Suleiman",
    role: "Director General",
    description:
      "Leads the day-to-day operations and strategic direction of all Basa'er institutions, ensuring alignment with the Waqf mission.",
  },
];

export default function AboutPage() {
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
            className="max-w-4xl"
          >
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading mt-4 leading-tight">
              A{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-gold">
                Waqf
              </span>{" "}
              Dedicated to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-primary-light">
                Educational Excellence
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mt-6 max-w-3xl">
              Basa&apos;er Quranic and Science College (BQSC) and Basa&apos;er
              Qur&apos;anic Memorization Schools (BQMS) are endowed institutions
              operating as a <strong>Waqf</strong> — a perpetual charitable trust
              dedicated entirely to the educational sector. We are not a
              profit-driven enterprise; every resource is reinvested into
              educational excellence for generations to come.
            </p>
          </motion.div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">
                Our Vision
              </h3>
              <p className="text-lg leading-relaxed text-text-primary">
                To nurture a unique generation of Qur&apos;anic scholars — male
                and female — who are proud of their faith, intellectually
                empowered, vocationally skilled, and ready to lead with
                Qur&apos;anic wisdom in the modern world.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">
                Our Mission
              </h3>
              <p className="text-lg leading-relaxed text-text-primary">
                We are committed to raising well-rounded individuals who have not
                only memorized the Qur&apos;an but also embody its teachings to
                positively influence their communities. Through structured
                programs, innovative methodologies, vocational training, and
                seamless technological integration, we deliver a holistic
                Qur&apos;anic education that harmonizes faith, academics, and
                life skills under divine guidance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-bold font-heading mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading">
              Leadership
            </h2>
            <p className="text-text-secondary mt-2">
              Guided by scholars committed to Waqf excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {leadership.map((leader, i) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-3xl p-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-primary/40">
                    {leader.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold font-heading text-sm">{leader.name}</h3>
                <p className="text-xs text-primary font-bold mt-1">{leader.role}</p>
                <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                  {leader.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading">
              Our Journey
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-6 pb-12 relative"
              >
                <div className="shrink-0 w-20 text-right">
                  <span className="text-lg font-extrabold text-primary font-heading">
                    {item.year}
                  </span>
                </div>
                <div className="relative pl-6 border-l-2 border-primary/20 pb-8">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <h3 className="font-bold font-heading">{item.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What Sets Us Apart */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading mb-8 text-center">
              What Sets Basa&apos;er Apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Beyond Memorization",
                  desc: "We don't just teach Hifdh — we produce Huffādh who are thinkers, leaders, scientists, entrepreneurs, and change-makers.",
                },
                {
                  title: "Holistic Curriculum",
                  desc: "Integration of Qur'anic mastery, Islamic studies, Nigerian/Western academics, Arabic language, and mandatory vocational skills.",
                },
                {
                  title: "Waqf Institution",
                  desc: "Permanently endowed to the educational sector — not a profit-driven enterprise. Every resource is reinvested into educational excellence.",
                },
                {
                  title: "Complete Independence",
                  desc: "Operates without external funding from any government or organization, relying on the commitment of founders, dedicated staff, and the trust of families served.",
                },
                {
                  title: "Character Building",
                  desc: "Students translate Qur'anic values into daily conduct, becoming role models in their families and communities.",
                },
                {
                  title: "Competency-Based Learning",
                  desc: "Specific competencies and standards are set for every activity to ensure student success and measurable progress.",
                },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl hover:bg-surface-container/50 transition-colors">
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-text-secondary mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

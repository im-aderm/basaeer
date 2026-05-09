"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { 
  Languages, 
  Scale, 
  History, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Laptop 
} from "lucide-react";

const pillars = [
  {
    title: "Arabic Language",
    description: "Mastering the language of the Qur'an through immersive linguistics and classical literature studies.",
    icon: Languages,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBg: "hover:bg-emerald-500/20",
  },
  {
    title: "Fiqh & Sharia",
    description: "Understanding the divine logic and jurisprudence that guides an ethical and purposeful life.",
    icon: Scale,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-500/20",
  },
  {
    title: "Seerah",
    description: "Drawing inspiration from the life of the Prophet (PBUH) to navigate modern challenges.",
    icon: History,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBg: "hover:bg-emerald-500/20",
  },
  {
    title: "Akhlaq",
    description: "Cultivating noble character, integrity, and social responsibility in every student.",
    icon: HeartHandshake,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-500/20",
  },
];

const scholars = [
  {
    name: "Dr. Ahmed Al-Farsi",
    role: "DEAN OF SHARIA STUDIES",
    quote: "Knowledge is a light that Allah places in the heart.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbJ7T8_glguTV4r67sQVZaCxsIvkdZCntsI8SSd-sGbD8v8weWlVXNWvyubZXOXG4AUBXnNnEHgwbzvK_jFov1qx3ESw4ySuRFKaOYCasUxJaZ-H4L1FbqZ5TWXsTVZCO3BfAjwvVCKy9QNPhtLdzl4jArXBGp-F28TbdMM88ZhXbCtnCEY1GrV8lV9B3KIyIRTZR2dqp-0om_ns03b8mfOesTV1j8tkL-7tPpw2CdcfR-JoUN_zHoqDlPGYz_Q7fTJ7LTbqjc4ZY",
  },
  {
    name: "Ustadha Fatima Zahra",
    role: "DIRECTOR OF TARBIYAH",
    quote: "Excellence in character is the true fruit of all education.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9WYKQbzwcuWJl46xv8eqgWPtv3CB5Mno9AecCn3jyA71QUR5IoiZP8CZST3bzoJLrqCZxveJTgYzmvKvQNHuY2E-pwhL-0wNK3ulUg5fAC_ytOXzZwUXtHfxx4rIRSnd8bRtdgbutSZ-3JZqgtdVcSejdy4WIr3JoD_9M_4HuMyrGrmkOe_wRFGS2D_HXIPiOQsICK3fLoxK4mjj71x3ib32K9IKrPnxXgPT_VcPGgSrkGbk9ydo2dwKxUcSgcitT-bnKbQoY2x4",
  },
  {
    name: "Shaykh Omar Khalil",
    role: "HEAD OF QUR'ANIC LINGUISTICS",
    quote: "Language is the key that unlocks the treasures of revelation.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1vn1I9MLasMOmXOjg__RCp6WknnEmr-fCeLrQ1asJ-kMRwvJl5BBZlsOGqOzNuL8LfvTKgQJzVKeC2cOrH0vG8R95WFaFQl3DQCBK2GCTuKQLwEKwX0ewG0Bbd-jtNkiOd3upk_QVfPcVuNAThrJYV9-ytEnz11P_D7nZNb1AHi0dAFz6nu9p8i3PVXir4E2ea5tLdqWUOfbFhduXoefuwMqWNWZqkxJAAm5Lfh-HIyrz2Z_EI8jKEUV2w41JyJLnkyRCcYLXvA4",
  },
];

export default function IslamicStudiesPage() {
  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5.878 18.09h19.022l-15.388 11.18 5.878 18.09-15.39-11.18-15.388 11.18 5.878-18.09L0 18.09h19.022L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7c3aed]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-bold text-[#d2bbff] tracking-[0.2em] uppercase block">
            ACADEMIC EXCELLENCE &amp; SPIRITUAL DEPTH
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Illuminating Hearts: <span className="text-[#d2bbff] drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">Our Spiritual Curriculum</span>
          </h1>
          <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
            At Basaeer, we bridge the gap between contemporary education and timeless Islamic wisdom, nurturing students who are academically brilliant and spiritually anchored.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
              EXPLORE CURRICULUM
            </button>
            <button className="px-8 py-4 rounded-full text-white font-bold bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              VIRTUAL TOUR
            </button>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16 relative">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
            The Four Pillars
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-yellow-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7c3aed]/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.hoverBg} flex items-center justify-center transition-colors duration-300`}>
                  <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className={`text-2xl font-bold font-heading ${pillar.color}`}>
                  {pillar.title}
                </h3>
                <p className="text-[#ccc3d8] text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tarbiyah Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
            <img 
              alt="Islamic Education Scholar studying" 
              className="w-full h-full object-cover opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI-woGB6cOM5I2bqpAGnuTbghDEjXBdhXOyKYCC2syX1jWXRGpMuTdDGuXBgAjZPhixP-tnU1oI0a5ljeWnioqpa4vRsNhtY7_rICHUa71PXLPS9IbPGGUj030efO7PB-9z9F9cLXJi88AszXfHBjTOhth-cIXE9zM6qiPAjumwJBTDRCSrpv_5T66cONq_xYrtIYn4MOJE1hYphlE2egh1Q-8g-ab_cA-Qfy1qiqkS-5e2yEE3CnU5tYws7ORqXvvS2155T7c898"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-transparent to-transparent"></div>
          </div>

          <div className="space-y-8">
            <span className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase block">
              HOLISTIC DEVELOPMENT
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
              The Essence of Tarbiyah
            </h2>
            <p className="text-lg text-[#ccc3d8] leading-relaxed">
              Education at Basaeer extends beyond the classroom walls. Through our Tarbiyah program, we integrate Islamic values into every facet of daily life—from the way we greet one another to how we solve complex scientific problems.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white font-heading">Mindful Integration</h4>
                  <p className="text-sm text-[#ccc3d8] leading-relaxed">Connecting spiritual ethics with scientific inquiry and social studies.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white font-heading">Character Mentorship</h4>
                  <p className="text-sm text-[#ccc3d8] leading-relaxed">One-on-one guidance to foster resilience, empathy, and leadership.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Distinguished Scholars */}
      <section className="py-24 bg-[#100d16]/40 mb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
              Distinguished Scholars
            </h2>
            <p className="text-lg text-[#ccc3d8] max-w-2xl mx-auto">
              Guided by educators who embody the wisdom they teach, bridging generations of knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {scholars.map((sch) => (
              <div key={sch.name} className="text-center space-y-4 group">
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#7c3aed]/20 p-2 relative group-hover:border-[#7c3aed]/50 transition-colors duration-300">
                  <img 
                    alt={sch.name} 
                    className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" 
                    src={sch.image} 
                  />
                </div>
                <h4 className="text-2xl font-bold text-white font-heading">
                  {sch.name}
                </h4>
                <p className="text-xs font-bold text-[#d2bbff] tracking-widest uppercase">
                  {sch.role}
                </p>
                <p className="text-[#ccc3d8] text-sm italic max-w-xs mx-auto">
                  &quot;{sch.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Integration */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 mb-16 relative overflow-hidden">
        <div className="bg-white/5 backdrop-blur-md p-8 md:p-16 rounded-[40px] border border-white/10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
                Where Tradition Meets Tomorrow
              </h2>
              <p className="text-lg text-[#ccc3d8] leading-relaxed">
                We utilize advanced educational technology—from VR historical walkthroughs to AI-assisted Arabic language tools—to bring traditional Islamic sciences to life for the digital generation.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <h5 className="text-3xl font-bold text-[#d2bbff] font-heading">98%</h5>
                  <p className="text-xs text-[#ccc3d8]">Global University Placement</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
                  <h5 className="text-3xl font-bold text-[#d2bbff] font-heading">100%</h5>
                  <p className="text-xs text-[#ccc3d8]">Values-Based Integration</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img 
                    alt="Modern Technology Hologram" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPRUM-TWTyimdjW6YLnmWgulfXqiPQHOLPCfxnC8MTaPQqwHWctMaMROdaDdIj8LU_-z0IZnNTbxxUK6Uy_uz3tW6kwnQEaTRLEn3eiMmtOyZAEss2w7JdbW8wZAJpRSk0IOHQUJBNlkPCJBSUtR6dEM1Fyd_mX9cAemcL3oZi7Qs5UhLEpRpfe0DT8B11cPXP4Yg3oqFI-GxnMWqJ5CLrNrVSRl-zZekw6B-dhGCH1bo_wD1bvIhf9TX4n8GO8ZGaeZQJ6KyTxdk" 
                  />
                </div>
                <div className="h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img 
                    alt="Digital Quranic studies" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXx-WHZpaMdE1RFF9uKvETwrv2JJpzezRsVQAwo7R1Vl-w5BXJY7n6dsUPujsgoXwB_KR55FHeqo7QG0QtR7RoBqYF810bGaJ4onmwZBYxFy_we7f9RYSUVKbBrRe0gJifDOXIaSZgdOi-FYoFhX10H6_XlT3hoYI08E9Ur5XNaRAoNg2psOIjc5ddOYRyS8qBCplfkNtDpCYF5K2zaAH-lAaFL2_nGSaHzVc_mnembiUR0pz8RuBYIIpS2iYDMJU0MAkn3eYR7yE" 
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img 
                    alt="Modern science classroom discussion" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxck1GGF7eNMUpF6v5wNTs4R-LtWAQ1Da0LrVlDIEMZy0Ee9qVmFofgObyD9nnAauJ5gqzXx-bFc8HcTaCk9y0-_J8zCaHrBAgI7ySRx2cxBESil15iSEgJUch6Gz3V0mpKCzWKkCHdDXgB8TdcYmoaaM_222e8RraY6euClcIlhJkzGuYwF1hplX3Z45T1ysCUSFxanx6d182kGEgbXMhv9o5Qkwv3RN3B7V96DyaVY48VzZnswIJzImXGdtgfKVW1fQYDJTA32Y" 
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img 
                    alt="Group of high-achieving students portrait" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuIg-2H8SUOVV0ahjlu62m5QIyFHd3jlrqdrnEzYBWjV14hMSWh1hk88SYyfW2v-zq0byk41LGcJXnF70tR6SrZCkRhRWOnuZ9dUAiZ9DKZLf0HZ6oFWmvV8RHM6trp3ufN8bMJLg5g-XY355hkiWPzJuHLlcpyUa0Dchb5RRYlzvbSWP0OHqcU4sqaPGW56RddLRhWXRokRphKOUAmGlwkSUrMc_1mqWbE8ys3LYD4oyU4YwxAMNnVJ5gCAVxFdKF9fSgVknTAxc" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

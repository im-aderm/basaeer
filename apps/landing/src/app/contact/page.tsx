"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { useNotification } from "@/context/NotificationContext";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Globe,
  MessageCircle,
  Building2,
  GraduationCap,
  Star,
} from "lucide-react";

const CONTACTS = [
  {
    state: "Kaduna",
    role: "Headquarters & Girls College",
    campus: "BQSC Headquarters Campus",
    phones: [
      { label: "Director General", number: "08039425673" },
      { label: "Day Program Principal", number: "08035326757" },
      { label: "Boarding Girls College Principal", number: "09060010987" },
    ],
  },
  {
    state: "Kano",
    role: "Boys Boarding Campuses",
    campus: "Al-Areefi Institute & Birrul Walidain Complex",
    phones: [
      { label: "Deputy Director", number: "08032646982" },
      { label: "Campus 1 Principal", number: "08034179578" },
      { label: "Campus 2 Principal", number: "08032361244" },
    ],
  },
  {
    state: "Bauchi",
    role: "Arrayyan Learning Centre",
    campus: "ALC — Nursery, Primary & Secondary",
    phones: [
      { label: "Executive Supervisor", number: "08136713292" },
    ],
  },
  {
    state: "Plateau",
    role: "Day Programs",
    campus: "Plateau State Campus",
    phones: [
      { label: "Principal", number: "07035000700" },
    ],
  },
];

export default function ContactPage() {
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "Admissions Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Message sent successfully!");
  };

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      <GradientBackground />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-primary tracking-[0.3em] uppercase"
            >
              Contact Basa&apos;er
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading"
            >
              We&apos;re Here to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-emerald">
                Guide You
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary leading-relaxed max-w-2xl"
            >
              Connect with our administrative team across Kaduna, Kano, Bauchi,
              and Plateau States. We are here to answer your questions about
              admissions, programs, and our Waqf-endowed institutions.
            </motion.p>
          </div>
        </section>

        {/* Campus Contact Cards */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONTACTS.map((campus, i) => (
              <motion.div
                key={campus.state}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card rounded-3xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {campus.state === "Kaduna" ? (
                      <Star size={20} className="text-accent-gold" />
                    ) : (
                      <Building2 size={20} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-lg">
                      {campus.state} State
                      {campus.state === "Kaduna" && (
                        <span className="ml-2 text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full font-bold uppercase">
                          HQ
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary">{campus.campus}</p>
                  </div>
                </div>

                <p className="text-sm text-text-secondary mb-4">{campus.role}</p>

                <div className="space-y-3">
                  {campus.phones.map((phone) => (
                    <a
                      key={phone.label}
                      href={`tel:${phone.number}`}
                      className="flex items-center gap-3 text-sm text-text-primary hover:text-primary transition-colors group"
                    >
                      <Phone size={14} className="text-primary shrink-0" />
                      <span className="flex-1">{phone.number}</span>
                      <span className="text-[10px] text-text-secondary font-medium">
                        {phone.label}
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form & Central Info */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Send size={140} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                  Inquiry Type
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option className="bg-background">Admissions Inquiry</option>
                  <option className="bg-background">General Information</option>
                  <option className="bg-background">Philanthropy / Waqf Support</option>
                  <option className="bg-background">Campus Visit Request</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                  Your Message
                </label>
                <textarea
                  placeholder="How can we help?"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Central Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-lg font-bold font-heading mb-6">Central Administration</h3>
              <div className="space-y-5">
                <a
                  href="mailto:baqmesng@gmail.com"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                      baqmesng@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/2348039425673"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center">
                    <MessageCircle size={18} className="text-accent-emerald" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">WhatsApp (Director General)</p>
                    <p className="text-sm font-semibold group-hover:text-accent-emerald transition-colors">
                      08039425673
                    </p>
                  </div>
                </a>

                <a
                  href="https://basaerschools.com.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                    <Globe size={18} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Website</p>
                    <p className="text-sm font-semibold group-hover:text-accent-gold transition-colors">
                      basaerschools.com.ng
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap size={20} className="text-primary" />
                <h3 className="font-bold font-heading">About Our Institution</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Basa&apos;er Schools & Colleges is a{" "}
                <strong>Waqf (endowed) institution</strong> — a perpetual charitable
                trust dedicated entirely to educational service. We operate without
                external funding, relying on the commitment of our founders, the
                dedication of our staff, and the trust of the families we serve.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mt-3">
                We welcome philanthropists who wish to partner with us in{" "}
                <strong>Sadaqat Jariyah (ongoing charity)</strong> — supporting
                Quranic camps, student scholarships, staff welfare, and facilities
                across Nigeria.
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

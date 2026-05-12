"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Compass, 
  Send, 
  Globe, 
  Instagram, 
  Linkedin, 
  Twitter 
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "Admissions Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="text-xs font-bold text-[#d2bbff] tracking-[0.3em] uppercase block">
              CONTACT BASAER
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading">
              Get in Touch: <span className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">We're Here to Guide You.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
              Connect with our dedicated administrative team at any of our branches to learn more about our vision for futuristic Islamic education.
            </p>
          </div>
        </section>

        {/* Multi-Branch Contact Info */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Campus */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors">
                  <School className="text-[#d2bbff]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white font-heading">
                  Main Campus
                </h3>
                <div className="space-y-4 text-sm text-[#ccc3d8]">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#d2bbff] shrink-0 mt-1" size={16} />
                    <p>12 Wisdom Way, Scholars District, Lagos State</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-[#d2bbff] shrink-0" size={16} />
                    <p>+234 800 123 4567</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-[#d2bbff] shrink-0" size={16} />
                    <p>main.campus@basaer.edu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VI Branch */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors">
                  <Building2 className="text-[#d2bbff]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white font-heading">
                  VI Branch
                </h3>
                <div className="space-y-4 text-sm text-[#ccc3d8]">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#d2bbff] shrink-0 mt-1" size={16} />
                    <p>88 Atlantic Towers, Victoria Island, Lagos</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-[#d2bbff] shrink-0" size={16} />
                    <p>+234 800 987 6543</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-[#d2bbff] shrink-0" size={16} />
                    <p>vi.branch@basaer.edu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Abuja Heights */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors">
                  <Building2 className="text-[#d2bbff]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white font-heading">
                  Abuja Heights
                </h3>
                <div className="space-y-4 text-sm text-[#ccc3d8]">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#d2bbff] shrink-0 mt-1" size={16} />
                    <p>Plot 45, Unity Crescent, Maitama, Abuja FCT</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-[#d2bbff] shrink-0" size={16} />
                    <p>+234 811 000 1111</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-[#d2bbff] shrink-0" size={16} />
                    <p>abuja@basaer.edu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form & Map Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Modern Contact Form */}
          <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Send className="text-[#d2bbff]" size={160} />
            </div>
            <h2 className="text-3xl font-bold text-white font-heading mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#ccc3d8] tracking-wider uppercase ml-1">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all duration-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#ccc3d8] tracking-wider uppercase ml-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all duration-300" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ccc3d8] tracking-wider uppercase ml-1">
                  Inquiry Type
                </label>
                <select 
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option className="bg-[#15121b]">Admissions Inquiry</option>
                  <option className="bg-[#15121b]">General Information</option>
                  <option className="bg-[#15121b]">Recruitment</option>
                  <option className="bg-[#15121b]">Campus Tour Request</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ccc3d8] tracking-wider uppercase ml-1">
                  Your Message
                </label>
                <textarea 
                  placeholder="How can we help you today?" 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all duration-300" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Interactive Map Overlay */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-[450px] relative shadow-2xl backdrop-blur-md">
              <img 
                alt="Minimalist dark digital map of Lagos campus locations" 
                className="w-full h-full object-cover opacity-50 grayscale brightness-75 contrast-125" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0lDAq9zffLM0Zu2Slg-N5TDtp6JfoB4PWCNFvm_4X8oeC21Ll9gbZM5HJm-pfKGaMsopl2-0lXosuCXGM566skSlHSDfG2Qe51OxoGfMdEEaNJxpJVJPdsFvmfvC9WsEdemDBHFuI8HicE_QpvI_y6FODa_hiFTbeFtBlglB1WslD53ThLNlXYXBhQPpQyunZJkWArM9W4pOU_eJz33Pi0suSVr0whG5G2gBv9LczRY3ouQ257jicbrAPDjHKpCM4GOonguzr29M" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-[#15121b]/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[#d2bbff] font-bold">Main Campus</p>
                  <p className="text-sm text-[#ccc3d8]">Scholars District, Lagos</p>
                </div>
                <button className="bg-[#7c3aed]/10 text-[#d2bbff] p-3 rounded-full hover:bg-[#7c3aed]/20 transition-colors">
                  <Compass size={20} />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-white font-heading mb-6">
                Official Social Handles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <Globe className="text-[#ccc3d8] group-hover:text-[#d2bbff] transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#ccc3d8]">Website</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <Instagram className="text-[#ccc3d8] group-hover:text-[#d2bbff] transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#ccc3d8]">Instagram</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <Linkedin className="text-[#ccc3d8] group-hover:text-[#d2bbff] transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#ccc3d8]">LinkedIn</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <Twitter className="text-[#ccc3d8] group-hover:text-[#d2bbff] transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#ccc3d8]">Twitter / X</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

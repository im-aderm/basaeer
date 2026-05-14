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
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block">
              CONTACT BASAER
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary font-heading">
              Get in Touch: <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">We're Here to Guide You.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Connect with our dedicated administrative team at any of our branches to learn more about our vision for futuristic Islamic education.
            </p>
          </div>
        </section>

        {/* Multi-Branch Contact Info */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Campus */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <School className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Main Campus
                </h3>
                <div className="space-y-4 text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary shrink-0 mt-1" size={16} />
                    <p>12 Wisdom Way, Scholars District, Lagos State</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary shrink-0" size={16} />
                    <p>+234 800 123 4567</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary shrink-0" size={16} />
                    <p>main.campus@basaer.edu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VI Branch */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  VI Branch
                </h3>
                <div className="space-y-4 text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary shrink-0 mt-1" size={16} />
                    <p>88 Atlantic Towers, Victoria Island, Lagos</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary shrink-0" size={16} />
                    <p>+234 800 987 6543</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary shrink-0" size={16} />
                    <p>vi.branch@basaer.edu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Abuja Heights */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.15)] transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary font-heading">
                  Abuja Heights
                </h3>
                <div className="space-y-4 text-sm text-text-secondary">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary shrink-0 mt-1" size={16} />
                    <p>Plot 45, Unity Crescent, Maitama, Abuja FCT</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary shrink-0" size={16} />
                    <p>+234 811 000 1111</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary shrink-0" size={16} />
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
          <div className="bg-surface-container border border-border p-8 md:p-10 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Send className="text-primary" size={160} />
            </div>
            <h2 className="text-3xl font-bold text-text-primary font-heading mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary tracking-wider uppercase ml-1">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary tracking-wider uppercase ml-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary tracking-wider uppercase ml-1">
                  Inquiry Type
                </label>
                <select 
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option className="bg-background">Admissions Inquiry</option>
                  <option className="bg-background">General Information</option>
                  <option className="bg-background">Recruitment</option>
                  <option className="bg-background">Campus Tour Request</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary tracking-wider uppercase ml-1">
                  Your Message
                </label>
                <textarea 
                  placeholder="How can we help you today?" 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface-container border border-border rounded-xl px-4 py-3 text-text-primary placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary text-text-primary py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Interactive Map Overlay */}
          <div className="space-y-8">
            <div className="bg-surface-container border border-border rounded-3xl overflow-hidden h-[450px] relative shadow-2xl backdrop-blur-md">
              <img 
                alt="Minimalist dark digital map of Lagos campus locations" 
                className="w-full h-full object-cover opacity-50 grayscale brightness-75 contrast-125" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0lDAq9zffLM0Zu2Slg-N5TDtp6JfoB4PWCNFvm_4X8oeC21Ll9gbZM5HJm-pfKGaMsopl2-0lXosuCXGM566skSlHSDfG2Qe51OxoGfMdEEaNJxpJVJPdsFvmfvC9WsEdemDBHFuI8HicE_QpvI_y6FODa_hiFTbeFtBlglB1WslD53ThLNlXYXBhQPpQyunZJkWArM9W4pOU_eJz33Pi0suSVr0whG5G2gBv9LczRY3ouQ257jicbrAPDjHKpCM4GOonguzr29M" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-background/80 backdrop-blur-md border border-border p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-primary font-bold">Main Campus</p>
                  <p className="text-sm text-text-secondary">Scholars District, Lagos</p>
                </div>
                <button className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary/20 transition-colors">
                  <Compass size={20} />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-surface-container border border-border p-8 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-text-primary font-heading mb-6">
                Official Social Handles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-surface-container transition-colors group">
                  <Globe className="text-text-secondary group-hover:text-primary transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">Website</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-surface-container transition-colors group">
                  <Instagram className="text-text-secondary group-hover:text-primary transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">Instagram</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-surface-container transition-colors group">
                  <Linkedin className="text-text-secondary group-hover:text-primary transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">LinkedIn</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-surface-container transition-colors group">
                  <Twitter className="text-text-secondary group-hover:text-primary transition-colors" size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">Twitter / X</span>
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

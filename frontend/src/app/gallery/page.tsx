"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, 
  ArrowRight, 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Compass,
  ArrowRightLeft,
  Tv,
  Users
} from "lucide-react";

const categories = ["ALL REELS", "FACILITIES", "ACADEMICS", "STUDENT LIFE", "GRADUATIONS", "TAHFEEZ"];

const galleryItems = [
  {
    id: 1,
    category: "ACADEMICS",
    title: "Innovation Lab Sessions",
    description: "Students engaged in collaborative high-tech laboratory projects with digital simulations.",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    category: "FACILITIES",
    title: "The Great Wisdom Hall",
    description: "Our grand school library with towering bookshelves, digital catalogs, and quiet study pods.",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    category: "GRADUATIONS",
    title: "Class of 2024 Ceremony",
    description: "Celebrating academic success and futures illuminated by shared knowledge.",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    category: "TAHFEEZ",
    title: "Spiritual Sanctuaries",
    description: "Peaceful prayer and memorization spaces detailed with beautiful Islamic architecture.",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    category: "STUDENT LIFE",
    title: "Interactive Social Hubs",
    description: "Modular high-energy lounge areas for student collaborations and clubs.",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    category: "FACILITIES",
    title: "The Visionary Theater",
    description: "Fully interactive immersive auditorium equipped for visual presentations and ceremonies.",
    image: "/placeholder.svg",
  },
];

const videos = [
  {
    title: "Cultural Heritage Festival",
    desc: "A celebration of global diversity and shared values through art and performance.",
    image: "/placeholder.svg",
  },
  {
    title: "Athletic Excellence Highlight",
    desc: "Pushing boundaries and building resilience in our state-of-the-art sports complex.",
    image: "/placeholder.svg",
  },
  {
    title: "Tahfeez Program Journey",
    desc: "Exploring the spiritual path of our Quranic memorization students.",
    image: "/placeholder.svg",
  },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("ALL REELS");

  const filteredItems = galleryItems.filter(
    (item) => activeTab === "ALL REELS" || item.category === activeTab
  );

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main>
        {/* Hero Section with Large Image Overlay */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              alt="Basaer Model School Campus Aerial view"
              fill
              sizes="100vw"
              className="opacity-40 scale-105"
              priority
              src="/placeholder.svg"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-4xl space-y-6">
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block">
              VIRTUAL CHRONICLE
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading">
              Windows into our World: <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)] block md:inline">Campus Life in Focus.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Witness the fusion of tradition and technological progress through our immersive visual journey.
            </p>
          </div>
        </section>

        {/* Visual Categories Filter */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-12 relative z-20">
          <div className="flex flex-wrap justify-center gap-3 py-6 border-b border-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                    activeTab === cat
                      ? "bg-primary text-text-primary shadow-[0_0_15px_rgba(0,160,225,0.4)] border border-primary"
                      : "bg-surface-container text-text-secondary border border-border hover:text-text-primary hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Masonry Gallery with Filter Transition */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <motion.div 
            layout 
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.id}
                  className="relative group overflow-hidden rounded-3xl bg-surface-container border border-border hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,160,225,0.2)] transition-all duration-500 flex flex-col break-inside-avoid"
                >
                  <Image
                    alt={item.title}
                    width={800}
                    height={600}
                    className="rounded-t-3xl grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    src={item.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="text-primary font-bold text-xs tracking-wider uppercase mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-white font-heading">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Video Highlights */}
        <section className="py-24 bg-surface-container-low backdrop-blur-md relative overflow-hidden mb-16 border-t border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl space-y-3">
                <span className="text-primary font-bold text-xs tracking-widest uppercase block">
                  CINEMATIC REELS
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
                  Experience the Basaer Journey in Motion.
                </h2>
              </div>
              <button className="text-primary font-bold text-xs tracking-widest uppercase flex items-center gap-2 group hover:text-text-primary transition-colors">
                VIEW CHANNEL <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Featured Video Card */}
              <div className="group relative aspect-video rounded-3xl overflow-hidden bg-surface-container border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer">
                <Image
                  alt="Modern STEM Robotics competition film frame"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  src="/placeholder.svg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(0,160,225,0.4)]">
                    <PlayCircle size={40} className="text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-primary font-bold text-xs tracking-wider uppercase mb-1 block">
                    FEATURED FILM
                  </span>
                  <h4 className="text-2xl font-bold text-white font-heading">
                    Innovation &amp; Spirit: The 2024 Showcase
                  </h4>
                </div>
              </div>

              {/* Secondary Videos List */}
              <div className="space-y-6">
                {videos.map((vid) => (
                  <div 
                    key={vid.title} 
                    className="flex flex-col sm:flex-row gap-6 bg-surface-container p-4 rounded-3xl border border-border group cursor-pointer hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="relative w-full sm:w-48 h-32 shrink-0 rounded-2xl overflow-hidden">
                      <Image
                        alt={vid.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        src={vid.image}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle size={24} className="text-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <h5 className="text-lg font-bold text-text-primary font-heading group-hover:text-primary transition-colors">
                        {vid.title}
                      </h5>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                        {vid.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tour Booking CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="bg-surface-container backdrop-blur-md rounded-[40px] p-8 md:p-16 text-center border-2 border-primary/10 relative overflow-hidden space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
              Want to see it in person?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Schedule a personalized campus tour and experience the future of education firsthand.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,160,225,0.3)] hover:scale-105 transition-all duration-300">
                BOOK A TOUR
              </button>
              <button className="px-8 py-4 rounded-full text-text-primary font-bold bg-surface-container border border-border hover:bg-white/10 hover:scale-105 transition-all duration-300">
                VIRTUAL OPEN DAY
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

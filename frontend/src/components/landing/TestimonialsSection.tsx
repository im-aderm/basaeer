"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Heart, MessageSquare, Send } from "lucide-react";

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState<number>(2);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const testimonials = [
    {
      id: 0,
      name: "Amina Bello",
      role: "Mother of Yusuf (Grade 4)",
      content: "Basaeer Model School has provided my child with an elite academic standard while firmly grounding him in Islamic ethics and Quranic memorization. The transformation is truly beautiful.",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=256&h=256",
      left: "10%",
      top: "40%",
      stars: 5,
    },
    {
      id: 1,
      name: "Kofi Mensah",
      role: "Father of Naa & Kojo",
      content: "Seeing my children excel in mathematics and robotics while reciting the Quran with perfect Tajweed is a dream come true. Basaeer's teachers are incredibly dedicated and caring.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256",
      left: "26%",
      top: "65%",
      stars: 5,
    },
    {
      id: 2,
      name: "Dr. Tariq Osei",
      role: "Father of Aisha (Secondary School)",
      content: "The level of scientific curiosity and research-oriented teaching at Basaeer is world-class. It is a unique sanctuary of academic excellence and spiritual depth.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256&h=256",
      left: "42%",
      top: "30%",
      stars: 5,
    },
    {
      id: 3,
      name: "Fatoumata Diallo",
      role: "Mother of Ibrahim (Tahfeez Scholar)",
      content: "The Tahfeez program is outstanding. The gentle, motivating, and highly supportive atmosphere has allowed my son to memorize 15 Juz with perfect Tajweed and genuine joy.",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256&h=256",
      left: "58%",
      top: "60%",
      stars: 5,
    },
    {
      id: 4,
      name: "Chinedu Okafor",
      role: "Father of Amara (Grade 6)",
      content: "Basaeer focuses on leadership and critical thinking. My daughter has grown so confident, creative, and responsible. It is the single best investment in her future.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256&h=256",
      left: "74%",
      top: "25%",
      stars: 5,
    },
    {
      id: 5,
      name: "Zahra Diop",
      role: "Mother of Mariam & Bilal",
      content: "What makes Basaeer special is the warm, loving community. The seamless integration of modern technology, scientific logic, and character building is unmatched.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256",
      left: "90%",
      top: "50%",
      stars: 5,
    },
  ];

  const dots = [
    { left: "18%", top: "52%" },
    { left: "34%", top: "48%" },
    { left: "50%", top: "43%" },
    { left: "66%", top: "46%" },
    { left: "82%", top: "38%" },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-24 bg-surface-container-lowest/10 overflow-hidden relative">
      {/* Injecting keyframe animation for smooth slide-up */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />

      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary-light/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Title & Subtitle */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading tracking-tight">
          What Our Parents Say
        </h2>
        <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Real stories from Basaeer families! See how our holistic, spiritual, and world-class academic environment has inspired their children.
        </p>
      </div>

      {/* Interactive Wavy Desktop View */}
      <div className="hidden lg:block max-w-6xl mx-auto h-[350px] relative mt-12 mb-8 select-none">
        {/* Animated Wavy Dotted Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1100 300" fill="none" preserveAspectRatio="none">
          <path 
            d="M 50 150 C 200 40, 250 260, 400 150 C 550 40, 600 260, 750 150 C 900 40, 950 260, 1050 150" 
            stroke="url(#goldGradient)" 
            strokeWidth="2.5" 
            strokeDasharray="6 6" 
            className="opacity-45"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative Small Dots along the wave */}
        {dots.map((dot, idx) => (
          <div 
            key={idx}
            style={{ left: dot.left, top: dot.top }}
            className="absolute w-2 h-2 rounded-full bg-primary/40 -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse"
          />
        ))}

        {/* Interactive Avatars */}
        {testimonials.map((stat) => {
          const isActive = activeIndex === stat.id;
          const isHovered = hoveredId === stat.id;
          return (
            <div 
              key={stat.id}
              style={{ left: stat.left, top: stat.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              onMouseEnter={() => setHoveredId(stat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveIndex(stat.id)}
            >
              {/* Profile Wrapper with Glow on Active */}
              <div 
                className={`relative cursor-pointer transition-all duration-500 rounded-full p-1 bg-background ${
                  isActive 
                    ? "scale-115 shadow-[0_0_25px_rgba(217,119,6,0.4)] border-4 border-primary ring-4 ring-primary/20" 
                    : "scale-100 hover:scale-110 border-2 border-primary-light/30 hover:border-primary-light shadow-md"
                }`}
              >
                <Image 
                  src={stat.avatar} 
                  alt={stat.name} 
                  width={72} 
                  height={72} 
                  className="rounded-full object-cover w-[72px] h-[72px] pointer-events-none"
                />
              </div>

              {/* Hover Tooltip Popup Card - Increased Width by 40% (w-[360px]) */}
              <div 
                className={`absolute bottom-[95px] left-1/2 -translate-x-1/2 w-[360px] p-6 rounded-2xl glass-card text-left transition-all duration-300 ease-out z-40 pointer-events-none origin-bottom ${
                  isHovered 
                    ? "opacity-100 scale-100 translate-y-0 shadow-2xl" 
                    : "opacity-0 scale-90 translate-y-4"
                }`}
              >
                <div className="flex gap-0.5 text-accent-gold mb-1.5">
                  {[...Array(stat.stars)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" className="text-accent-gold" />
                  ))}
                </div>
                <p className="text-xs text-text-primary font-medium italic mb-2.5 leading-relaxed">
                  "{stat.content}"
                </p>
                <h5 className="text-xs font-extrabold text-primary font-heading">{stat.name}</h5>
                <p className="text-[10px] text-text-secondary font-semibold">{stat.role}</p>
                
                {/* Tooltip Caret */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-r border-b border-primary/10"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Slider Info Card & Navigation - Beautiful Active Card with 40% Increased Width */}
      <div className="hidden lg:block max-w-5xl mx-auto px-6 relative mt-12 select-none animate-[slideUp_0.5s_ease-out]">
        <div className="flex items-center gap-8 w-full justify-between">
          <button 
            onClick={handlePrev} 
            className="w-12 h-12 rounded-full border border-primary/10 bg-white/80 hover:bg-white flex items-center justify-center text-text-primary hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
            key={activeIndex}
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.65) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(217, 119, 6, 0.15)",
              boxShadow: "0 15px 35px rgba(217, 119, 6, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
            className="flex-1 p-8 rounded-[2.5rem] text-center space-y-4 max-w-4xl mx-auto"
          >
            <div className="flex gap-0.5 text-accent-gold justify-center">
              {[...Array(testimonials[activeIndex].stars)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="text-accent-gold" />
              ))}
            </div>
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed italic font-medium">
              "{testimonials[activeIndex].content}"
            </p>
            <div>
              <h4 className="text-base font-bold text-text-primary font-heading">
                {testimonials[activeIndex].name}
              </h4>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">
                {testimonials[activeIndex].role}
              </p>
            </div>
          </div>

          <button 
            onClick={handleNext} 
            className="w-12 h-12 rounded-full border border-primary/10 bg-white/80 hover:bg-white flex items-center justify-center text-text-primary hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet View (Breathtaking 3-Card Stack Testimonials from Reference Image) */}
      <div className="block lg:hidden w-full overflow-hidden py-10 px-4">
        {/* Card Row Stack */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 relative min-h-[440px] px-2">
          {[-1, 0, 1].map((offset) => {
            const index = (activeIndex + offset + testimonials.length) % testimonials.length;
            const stat = testimonials[index];
            const isCenter = offset === 0;
            const displayIndex = String(index + 1).padStart(2, "0");

            return (
              <div
                key={stat.id}
                onClick={() => !isCenter && setActiveIndex(index)}
                className={`transition-all duration-500 rounded-[2.5rem] p-6 flex flex-col justify-between min-h-[380px] relative cursor-pointer select-none ${
                  isCenter 
                    ? "w-[260px] sm:w-[310px] z-30 scale-100 opacity-100 shadow-[0_20px_50px_rgba(217,119,6,0.15)]" 
                    : "w-[180px] sm:w-[220px] z-10 scale-85 opacity-35 blur-[2px] hidden sm:flex"
                }`}
                style={
                  isCenter
                    ? {
                        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(217, 119, 6, 0.12) 100%)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "2px solid rgba(217, 119, 6, 0.25)",
                      }
                    : {
                        background: "rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }
                }
              >
                {/* Double quotes watermarked on top left */}
                <div className={`absolute top-4 left-6 text-7xl font-serif leading-none select-none ${isCenter ? "text-primary/10" : "text-text-primary/5"}`}>
                  “
                </div>

                {/* Floating Hearts bubble for active center card */}
                {isCenter && (
                  <div className="absolute -top-3 -right-3 bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md z-50 animate-bounce">
                    <Heart size={10} fill="currentColor" className="text-rose-500 animate-pulse" />
                    <span>{120 + stat.id * 5}</span>
                  </div>
                )}

                {/* Top Section: Avatar, Name, Stars */}
                <div className="relative pt-4 flex flex-col items-center text-center space-y-2">
                  <Image 
                    src={stat.avatar} 
                    alt={stat.name} 
                    width={56} 
                    height={56} 
                    className={`rounded-full object-cover pointer-events-none ${isCenter ? "border-2 border-primary/40 shadow-md animate-[pulse_3s_infinite]" : "border border-neutral-200"}`}
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-text-primary font-heading leading-tight">{stat.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-text-secondary font-semibold">{stat.role.split(" of ")[0]}</p>
                  </div>
                  {isCenter && (
                    <div className="flex gap-0.5 text-accent-gold justify-center">
                      {[...Array(stat.stars)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" className="text-accent-gold" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Middle Content */}
                <p className={`text-text-secondary leading-relaxed italic text-center px-2 py-4 ${isCenter ? "text-xs sm:text-sm font-medium line-clamp-6" : "text-[10px] sm:text-xs line-clamp-4"}`}>
                  "{stat.content}"
                </p>

                {/* Bottom Section: Social Icons for Center Card */}
                <div className="flex items-center justify-between border-t border-primary/5 pt-4">
                  {isCenter ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Heart size={15} className="hover:text-rose-500 transition-colors cursor-pointer active:scale-125" />
                      <MessageSquare size={15} className="hover:text-primary transition-colors cursor-pointer" />
                      <Send size={15} className="hover:text-primary transition-colors cursor-pointer" />
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                  <span className="text-[10px] font-extrabold text-primary/40 font-heading">
                    {displayIndex}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Navigation Buttons & Dot Indicators */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <button 
            onClick={handlePrev} 
            className="w-10 h-10 rounded-full border border-primary/10 bg-white/80 flex items-center justify-center text-text-primary active:scale-90 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {testimonials.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-primary/20"}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext} 
            className="w-10 h-10 rounded-full border border-primary/10 bg-white/80 flex items-center justify-center text-text-primary active:scale-90 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SLIDES = [
  {
    id: 1,
    type: "video",
    src: "https://player.vimeo.com/external/494252666.sd.mp4?s=72fd290c010c730e0129f123381e33f38994784a&profile_id=165",
    headline: "Excellence in education, rooted in faith.",
    subheadline: "Basaeer International School bridges the best of secular and Islamic education — nurturing minds that excel academically while embodying the values of the Quran.",
    featuredLabel: "Our Curriculum",
    featuredValue: "Cambridge Accredited & Quran Integrated",
    actionLeft: "Our History & Mission",
    actionLeftLink: "/#about",
    actionRight: "VIEW ACADEMICS",
    actionRightLink: "/#programs",
    location: "Basaeer International School",
    ctaLabel: "Apply Now",
    ctaLink: "/admission",
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
    headline: "Where rigor meets character.",
    subheadline: "Our Cambridge-accredited curriculum develops critical thinkers who excel academically while embodying Islamic ethics and values.",
    featuredLabel: "Featured Subject",
    featuredValue: "Islamic Integration in Sciences",
    actionLeft: "Curriculum Overview",
    actionLeftLink: "/#programs",
    actionRight: "VIEW SUBJECTS",
    actionRightLink: "/#programs",
    location: "Academic Wing",
    ctaLabel: "Learn More",
    ctaLink: "/#programs",
  },
  {
    id: 3,
    type: "video",
    src: "https://player.vimeo.com/external/403212042.sd.mp4?s=706346f0490f845a74797170868f946e336d39d9&profile_id=165",
    headline: "Masters of memorization.",
    subheadline: "Our dedicated Hifdh program combines traditional memorization techniques with modern pedagogy, producing Huffadh who understand and embody the Quran.",
    featuredLabel: "Featured Achievement",
    featuredValue: "15 Huffadh Graduated in 2025",
    actionLeft: "Quran Program",
    actionLeftLink: "/#programs",
    actionRight: "VIEW HIFDH TRACK",
    actionRightLink: "/#programs",
    location: "Quranic Wing",
    ctaLabel: "Apply for Tahfeez",
    ctaLink: "/admission",
    showPlayIcon: true,
  },
  {
    id: 4,
    type: "image",
    src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop",
    headline: "A community united.",
    subheadline: "Partner with us in raising the next generation of Muslim leaders who will excel in this world and prepare for the next.",
    featuredLabel: "Featured Event",
    featuredValue: "Annual Spring Fundraiser in 2 Weeks",
    actionLeft: "Community Events",
    actionLeftLink: "/#contact",
    actionRight: "GET INVOLVED",
    actionRightLink: "/#contact",
    location: "Community",
    ctaLabel: "Join Our Community",
    ctaLink: "/#contact",
  },
];

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-background">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
        }}
        loop={true}
        navigation={{
          nextEl: ".swiper-button-next-slider",
          prevEl: ".swiper-button-prev-slider",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            <div className="flex flex-col lg:flex-row w-full h-full">
              {/* Visual Panel (Left) */}
              <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full overflow-hidden bg-surface-container border-r border-border">
                <motion.div
                  initial={{ scale: 1.05 }}
                  animate={{ scale: index === activeIndex ? 1 : 1.05 }}
                  transition={{ duration: 20, ease: "linear" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {slide.type === "video" ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={slide.src} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={slide.src}
                      alt={slide.headline}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  )}
                </motion.div>

                {/* Glassy Overlay with subtle primary tint */}
                <div className="absolute inset-0 bg-background/30 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r" />

                {slide.type === "video" && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className={`absolute ${slide.showPlayIcon ? 'bottom-8 right-8' : 'inset-0 m-auto'} z-10 w-20 h-20 rounded-full border border-border bg-background/50 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-background/80 hover:border-primary cursor-pointer`}
                    aria-label={`Play ${slide.headline}`}
                  >
                    <Play className="w-8 h-8 text-accent-gold fill-current ml-1" aria-hidden="true" />
                  </motion.button>
                )}
              </div>

              {/* Content Panel (Right) */}
              <div className="relative w-full lg:w-1/2 h-full bg-background flex items-center px-8 lg:px-20 py-24 lg:py-0">
                <AnimatePresence mode="wait">
                  {activeIndex === index && (
                    <div className="max-w-xl space-y-10">
                      <div className="space-y-6">
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="text-4xl lg:text-5xl font-heading font-extrabold text-text-primary leading-[1.1] text-gradient-primary"
                        >
                          {slide.headline}
                        </motion.h1>

                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="text-lg text-text-secondary leading-relaxed font-medium"
                        >
                          {slide.subheadline}
                        </motion.p>
                      </div>

                      {/* Premium Glass Panel Featured Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="group flex flex-col sm:flex-row glass-card border border-border p-1 hover:border-primary/50 transition-all duration-500 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="px-6 py-4 bg-primary/10 rounded-lg flex flex-col justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">
                            {slide.featuredLabel}
                          </span>
                        </div>
                        <div className="px-6 py-4 flex flex-col justify-center">
                          <span className="text-text-primary font-heading font-bold text-base leading-tight">
                            {slide.featuredValue}
                          </span>
                        </div>
                      </motion.div>

                      {/* Action Links */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-4"
                      >
                        <Link href={slide.actionLeftLink} className="relative text-sm font-bold tracking-widest text-primary uppercase group">
                          {slide.actionLeft}
                          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary/20 group-hover:bg-primary transition-all duration-300"></span>
                        </Link>
                        <span className="text-text-secondary opacity-30">•</span>
                        <Link href={slide.actionRightLink} className="relative text-sm font-bold tracking-widest text-text-primary uppercase group overflow-hidden">
                          <span className="block transition-transform duration-300 group-hover:-translate-y-full">{slide.actionRight}</span>
                          <span className="absolute top-full left-0 block transition-transform duration-300 group-hover:-translate-y-full text-primary">{slide.actionRight}</span>
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom Metadata Bar */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-md border-t border-border z-30 flex items-center justify-between px-8 lg:px-20 text-text-primary select-none">
        <div className="flex items-center gap-12 h-full">
          {/* Slide Counter */}
          <div className="flex items-center gap-6">
            <button className="swiper-button-prev-slider p-2 text-text-secondary hover:text-primary transition-colors cursor-pointer" aria-label="Previous Slide">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <span className="text-sm font-bold tracking-widest min-w-[2.5rem] text-center text-gradient-primary">
              {(activeIndex + 1).toString().padStart(2, '0')} / {SLIDES.length.toString().padStart(2, '0')}
            </span>
            <button className="swiper-button-next-slider p-2 text-text-secondary hover:text-primary transition-colors cursor-pointer" aria-label="Next Slide">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Location Tag */}
          <div className="hidden sm:flex items-center gap-3">
            <MapPin size={16} className="text-accent-gold" />
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {SLIDES[activeIndex].location}
            </span>
          </div>
        </div>

        {/* Footer CTA Button */}
        <Link
          href={SLIDES[activeIndex].ctaLink || '/admission'}
          className="btn-premium-primary px-6 py-2.5 text-sm font-semibold text-white cursor-pointer"
          aria-label={SLIDES[activeIndex].ctaLabel}
        >
          {SLIDES[activeIndex].ctaLabel}
        </Link>
      </div>
    </section>
  );
}

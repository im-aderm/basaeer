"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play, MapPin } from "lucide-react";
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
        headline: "America's first public Islamic school.",
        subheadline: "Basaeer International School's mission-first commissioned at its founding in 2010-is to involve the city of Boston in preserving and proliferating Islamic values through academic excellence.",
        featuredLabel: "Featured Program",
        featuredValue: "Cambridge Curriculum in 4.5 Minutes",
        actionLeft: "Our History & Mission",
        actionLeftLink: "/about",
        actionRight: "VIEW ACADEMICS",
        actionRightLink: "/academics",
        location: "Boston, MA",
        ctaLabel: "Explore",
        gradient: "linear-gradient(135deg, rgba(10, 31, 68, 0.4) 0%, rgba(10, 31, 68, 0.2) 100%)",
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
        actionLeftLink: "/curriculum",
        actionRight: "VIEW SUBJECTS",
        actionRightLink: "/subjects",
        location: "Academic Wing",
        ctaLabel: "Learn More",
        gradient: "linear-gradient(135deg, rgba(10, 31, 68, 0.4) 0%, rgba(10, 31, 68, 0.2) 100%)",
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
        actionLeftLink: "/hifdh",
        actionRight: "VIEW HIFDH TRACK",
        actionRightLink: "/hifdh-track",
        location: "Quranic Wing",
        ctaLabel: "Apply Now",
        gradient: "linear-gradient(135deg, rgba(31, 94, 74, 0.4) 0%, rgba(31, 94, 74, 0.2) 100%)",
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
        actionLeftLink: "/events",
        actionRight: "GET INVOLVED",
        actionRightLink: "/volunteer",
        location: "Community",
        ctaLabel: "Join Us",
        gradient: "linear-gradient(135deg, rgba(183, 110, 60, 0.4) 0%, rgba(183, 110, 60, 0.2) 100%)",
    },
];



export function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-brand-navy">
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
                            <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full overflow-hidden bg-brand-navy border-r border-white/5">
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

                                <div className="absolute inset-0 bg-black/20" />

                                {slide.type === "video" && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        className={`absolute ${slide.showPlayIcon ? 'bottom-8 right-8' : 'inset-0 m-auto'} z-10 w-20 h-20 rounded-full border-2 border-brand-cream/60 bg-brand-navy/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-brand-navy/50`}
                                    >
                                        <Play className="w-8 h-8 text-brand-gold fill-current ml-1" />
                                    </motion.button>
                                )}
                            </div>

                            {/* Content Panel (Right) */}
                            <div className="relative w-full lg:w-1/2 h-full bg-brand-navy flex items-center px-8 lg:px-20 py-20 lg:py-0">
                                <AnimatePresence mode="wait">
                                    {activeIndex === index && (
                                        <div className="max-w-xl space-y-10">
                                            <div className="space-y-6">
                                                <motion.h1
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                                    className="text-4xl lg:text-6xl font-serif font-semibold text-brand-cream leading-[1.1]"
                                                >
                                                    {slide.headline}
                                                </motion.h1>

                                                <motion.p
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                    className="text-lg lg:text-xl font-sans text-brand-cream/80 font-light leading-relaxed max-w-lg"
                                                >
                                                    {slide.subheadline}
                                                </motion.p>
                                            </div>

                                            {/* Featured Item Panel */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, delay: 0.4 }}
                                                className="group flex flex-col sm:flex-row bg-white/5 border border-white/10 p-1 hover:bg-brand-gold/10 transition-all duration-500 rounded-sm overflow-hidden"
                                            >
                                                <div className="px-6 py-4 bg-brand-gold/20 flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold whitespace-nowrap">
                                                        {slide.featuredLabel}
                                                    </span>
                                                </div>
                                                <div className="px-6 py-4 flex flex-col justify-center">
                                                    <span className="text-brand-cream font-serif text-lg leading-tight">
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
                                                <Link href={slide.actionLeftLink} className="relative text-sm font-bold tracking-widest text-brand-gold uppercase group">
                                                    {slide.actionLeft}
                                                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-brand-gold/30 group-hover:bg-brand-gold transition-all duration-300"></span>
                                                </Link>
                                                <span className="text-brand-gold/40">•</span>
                                                <Link href={slide.actionRightLink} className="relative text-sm font-bold tracking-widest text-brand-cream uppercase group overflow-hidden">
                                                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">{slide.actionRight}</span>
                                                    <span className="absolute top-full left-0 block transition-transform duration-300 group-hover:-translate-y-full text-brand-gold">{slide.actionRight}</span>
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
            <div className="absolute bottom-0 left-0 w-full h-20 bg-brand-navy/80 backdrop-blur-md border-t border-white/10 z-30 flex items-center justify-between px-8 lg:px-20 text-brand-cream select-none">
                <div className="flex items-center gap-12 h-full">
                    {/* Slide Counter */}
                    <div className="flex items-center gap-6">
                        <button className="swiper-button-prev-slider p-2 text-brand-gold/60 hover:text-brand-gold transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold tracking-widest min-w-[2.5rem] text-center">
                            {(activeIndex + 1).toString().padStart(2, '0')} / {SLIDES.length.toString().padStart(2, '0')}
                        </span>
                        <button className="swiper-button-next-slider p-2 text-brand-gold/60 hover:text-brand-gold transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Location Tag */}
                    <div className="hidden sm:flex items-center gap-3">
                        <MapPin size={16} className="text-brand-gold" />
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                            {SLIDES[activeIndex].location}
                        </span>
                    </div>
                </div>

                {/* Footer CTA */}
                <button className="group relative px-6 py-2.5 bg-brand-gold text-brand-navy rounded-sm font-bold text-[10px] uppercase tracking-[2px] overflow-hidden transition-all duration-300 shadow-lg hover:shadow-brand-gold/20 active:scale-95">
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-brand-cream">{SLIDES[activeIndex].ctaLabel}</span>
                    <div className="absolute inset-0 bg-brand-navy translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>

            <style jsx global>{`
                .swiper-button-disabled {
                    opacity: 0.2;
                    cursor: not-allowed;
                }
            `}</style>
        </section>
    );
}

"use client";

import Link from "next/link";
import Image from "next/image"; // Added Image import
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            {/* Background Shapes/Patterns (Removed for minimal aesthetic) */}

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Admissions Open for 2025-2026
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                            Excellence in <br />
                            <span className="text-primary">Knowledge & Faith</span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Basaeer School combines world-class academic standards with deep spiritual auditing, nurturing the next generation of leaders and scholars.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link
                                href="/apply"
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                            >
                                Start Application
                            </Link>
                            <button className="px-8 py-4 bg-white text-foreground border border-input rounded-lg font-semibold hover:bg-secondary transition-all w-full sm:w-auto">
                                Book a Tour
                            </button>
                        </div>

                        {/* Trust Badges (Removed for minimal aesthetic) */}
                    </div>

                    {/* Hero Image */}
                    <div className="flex-1 relative animate-in fade-in duration-1000 delay-300">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Replace with actual image */}
                            <Image
                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                                alt="Students Learning"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Absolute Elements */}
                        <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce duration-[3000ms]">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <span className="text-2xl">🎓</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Students Enrolled</p>
                                <p className="font-bold text-lg">2,500+</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Wave Separator at bottom */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[60px] w-[calc(113%_+_1.3px)] fill-background">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
}

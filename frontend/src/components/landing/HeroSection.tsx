"use client";

import dynamic from "next/dynamic";

const HeroSlider = dynamic(() => import("./HeroSlider").then((mod) => mod.HeroSlider), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-brand-navy animate-pulse" />
});
export function HeroSection() {
    return (
        <section id="hero" className="relative w-full h-[100vh] overflow-hidden">
            <HeroSlider />

            {/* Wave Separator at bottom - Optional, but keeping for continuity if desired */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none overflow-hidden leading-[0]">
                <svg
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative block h-[40px] md:h-[60px] w-[calc(113%_+_1.3px)] fill-white dark:fill-slate-900"
                >
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
}

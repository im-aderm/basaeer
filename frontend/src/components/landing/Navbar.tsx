"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { School, Menu, X, ChevronDown } from "lucide-react";

const sections = [
    { name: "About Us", href: "/#about" },
    { name: "Programs", href: "/#programs" },
    { name: "Apply Now", href: "/admission" },
    { name: "Contact Us", href: "/#contact" },
];

const campusLinks = [
    { name: "Main Campus", href: "/#contact" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [campusOpen, setCampusOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-brand-navy/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
                : "bg-transparent"
                }`}
            aria-label="Main navigation"
        >
            <div className="container mx-auto px-6">
                <div className="flex h-20 items-center justify-between gap-8">
                    {/* Left nav links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {sections.slice(0, 2).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-brand-cream/80 hover:text-brand-cream text-sm font-medium tracking-wide transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {/* Campus dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setCampusOpen(!campusOpen)}
                                className="flex items-center gap-1.5 text-brand-cream/80 hover:text-brand-cream text-sm font-medium tracking-wide transition-colors"
                                aria-expanded={campusOpen}
                                aria-haspopup="true"
                            >
                                Campus
                                <ChevronDown size={14} className={`transition-transform ${campusOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                            </button>
                            {campusOpen && (
                                <div className="absolute top-full left-0 mt-2 bg-brand-navy border border-white/10 rounded-xl overflow-hidden shadow-lg min-w-[160px]">
                                    {campusLinks.map((c) => (
                                        <Link
                                            key={c.name}
                                            href={c.href}
                                            onClick={() => setCampusOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-brand-cream/80 hover:text-brand-cream hover:bg-white/5 transition-colors"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 font-bold text-2xl text-brand-cream shrink-0"
                        aria-label="Basaeer International School — Home"
                    >
                        <Image src="/logo.png" alt="Basaeer Logo" width={40} height={40} className="w-10 h-10 object-contain rounded-full bg-brand-navy border border-brand-gold/30" />
                        <span className="hidden sm:block">Basaeer</span>
                    </Link>

                    {/* Right nav links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {sections.slice(2).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium tracking-wide transition-colors ${link.name === "Apply Now"
                                    ? "px-4 py-2 bg-brand-gold text-brand-navy rounded-full hover:bg-brand-gold/90"
                                    : "text-brand-cream/80 hover:text-brand-cream"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="px-4 py-2 border border-brand-cream/30 text-brand-cream rounded-full text-sm font-medium hover:border-brand-cream hover:bg-brand-cream/10 transition-all"
                        >
                            Staff Portal
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-brand-cream"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-label={isMobileOpen ? "Close mobile menu" : "Open mobile menu"}
                        aria-expanded={isMobileOpen}
                    >
                        {isMobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMobileOpen && (
                <div
                    className="lg:hidden bg-brand-navy/95 backdrop-blur-md border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-200"
                    role="menu"
                >
                    <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                        {sections.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`text-base font-medium transition-colors ${link.name === "Apply Now"
                                    ? "text-brand-gold"
                                    : "text-brand-cream/80 hover:text-brand-cream"
                                    }`}
                                role="menuitem"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            onClick={() => setIsMobileOpen(false)}
                            className="text-base font-medium text-brand-cream/60 hover:text-brand-cream transition-colors"
                            role="menuitem"
                        >
                            Staff Portal
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

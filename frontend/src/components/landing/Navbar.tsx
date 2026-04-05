"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, School } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinksLeft = [
        { name: "Basaeer School", href: "#" },
        { name: "Campus Map", href: "#" },
        { name: "Curriculum", href: "#" },
        { name: "Parents & Friends", href: "#" },
    ];

    const navLinksRight = [
        { name: "Plan Your Visit", href: "#" },
        { name: "Islamic Values", href: "#" },
        { name: "Boston, MA", href: "#" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Left Group */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinksLeft.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative text-sm font-bold tracking-widest uppercase transition-all duration-300 group ${isScrolled ? "text-brand-navy" : "text-brand-cream"}`}
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Toggle (Middle on mobile) */}
                <button
                    className={`md:hidden p-2 ${isScrolled ? "text-brand-navy" : "text-brand-cream"}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Right Group */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinksRight.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative text-sm font-bold tracking-widest uppercase transition-all duration-300 group ${isScrolled ? "text-brand-navy" : "text-brand-cream"}`}
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-brand-navy border-t border-white/10 absolute w-full left-0 top-full p-6 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                    {[...navLinksLeft, ...navLinksRight].map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-brand-cream py-2 border-b border-white/5 last:border-0"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

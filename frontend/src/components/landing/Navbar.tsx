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

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "About Us", href: "#about" },
        { name: "Classes", href: "#programs" },
        { name: "Teachers", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contact", href: "#footer" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4 dark:bg-slate-900/90" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 font-bold text-2xl text-primary">
                    <School size={32} />
                    <span>Basaeer</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-foreground" : "text-foreground" // Adjust if hero bg is dark
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95"
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border absolute w-full left-0 top-full p-6 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-foreground py-2 border-b border-border/50 last:border-0"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center justify-between mt-4">
                        <Link
                            href="/login"
                            className="px-6 py-2 bg-primary text-white rounded-full font-semibold"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

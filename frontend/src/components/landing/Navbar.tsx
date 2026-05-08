"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "About Us", href: "/#about" },
  { name: "Programs", href: "/#programs" },
  { name: "Apply Now", href: "/admission" },
  { name: "Contact Us", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-20 flex items-center",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
              onMouseEnter={() => setActiveLink(link.name)}
              onMouseLeave={() => setActiveLink("")}
            >
              {link.name}
              {(activeLink === link.name) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_var(--primary)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Campus dropdown */}
          <div className="relative">
            <button
              onClick={() => setCampusOpen(!campusOpen)}
              className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Campus
              <ChevronDown
                size={14}
                className={cn("transition-transform duration-300", campusOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {campusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-3 p-2 w-48 rounded-xl glass-card border border-border shadow-2xl z-50"
                >
                  <Link
                    href="/#contact"
                    onClick={() => setCampusOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Main Campus
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-surface-container border border-border shadow-inner overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Basaeer Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain rounded-full"
            />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-gradient-primary">
            Basaeer
          </span>
        </Link>

        {/* Right Links & Theme Toggle */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8">
            {links.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-semibold transition-all duration-300",
                  link.name === "Apply Now"
                    ? "btn-premium-primary px-6 py-2.5 text-white"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login" className="btn-premium-secondary px-6 py-2.5 text-sm font-semibold">
              Staff Portal
            </Link>
          </div>

          {/* Theme Switcher with spring animation */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-border hover:bg-surface-bright transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-accent-gold" />
              ) : (
                <Sun className="w-5 h-5 text-accent-gold" />
              )}
            </motion.div>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-text-primary hover:text-primary transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 lg:hidden bg-background/95 backdrop-blur-md border-b border-border overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "text-lg font-semibold transition-colors",
                    link.name === "Apply Now" ? "text-primary" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="text-lg font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Staff Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

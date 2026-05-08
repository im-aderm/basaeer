"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Academics", href: "/#programs" },
  { name: "Admissions", href: "/admission/apply/1" },
  { name: "Campuses", href: "/#campuses" },
];

const sections = [
  { name: "Tahfeez Academy", href: "/academics/tahfeez" },
  { name: "Primary School", href: "/academics/primary" },
  { name: "Nursery School", href: "/academics/nursery" },
  { name: "Secondary School", href: "/academics/secondary" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [activeLink, setActiveLink] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

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
        {/* Left Logo */}
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

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
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

          {/* Sections Dropdown Link */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center gap-1.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              Sections <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full w-56 bg-background/95 backdrop-blur-md border border-border rounded-2xl p-2 shadow-xl z-50 overflow-hidden"
                >
                  {sections.map((section) => (
                    <Link
                      key={section.name}
                      href={section.href}
                      className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors"
                    >
                      {section.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Portal & Theme Toggle */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/login" className="btn-premium-secondary px-6 py-2.5 text-sm font-semibold">
              Staff Portal
            </Link>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              const current = resolvedTheme || "dark";
              setTheme(current === "dark" ? "light" : "dark");
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-border hover:bg-surface-bright transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {mounted ? (
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {isDark ? (
                  <Moon className="w-5 h-5 text-accent-gold" />
                ) : (
                  <Sun className="w-5 h-5 text-accent-gold" />
                )}
              </motion.div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-border border-t-primary animate-spin" />
            )}
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
                  className="text-lg font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Dropdown Sections */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">School Sections</p>
                {sections.map((section) => (
                  <Link
                    key={section.name}
                    href={section.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block text-lg font-semibold text-text-secondary hover:text-text-primary transition-colors pl-4"
                  >
                    {section.name}
                  </Link>
                ))}
              </div>

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

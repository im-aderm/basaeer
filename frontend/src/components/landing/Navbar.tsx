"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { campuses } from "@/lib/school-data";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Admissions", href: "/admission" },
  { name: "Campuses", href: "/campuses" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-20 flex items-center",
        scrolled
          ? "bg-background/95 md:bg-background/45 md:backdrop-blur-lg border-b border-border/40 shadow-xl"
          : "bg-transparent border-b border-transparent shadow-none"
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Basaer"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </Link>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.name}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_var(--primary)] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-full overflow-hidden group inline-block shadow-[0_0_15px_rgba(0,160,225,0.25)] hover:shadow-[0_0_25px_rgba(0,160,225,0.55)] transition-shadow duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent z-20 pointer-events-none"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 0.3, ease: "easeInOut" }}
              />
              <Link
                href="/login"
                className="relative px-7 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-light border border-primary/60 text-white font-heading font-extrabold text-xs tracking-[0.12em] uppercase transition-all duration-300 z-10 block"
              >
                Login
              </Link>
            </motion.div>
          </div>

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
            <div className="px-6 py-8 flex flex-col gap-4">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "text-lg font-semibold transition-colors",
                      active ? "text-primary" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}

              {/* Mobile Campuses sub-list */}
              <div className="pl-4 border-l-2 border-border space-y-2 mt-1">
                {campuses.map((campus) => (
                  <Link
                    key={campus.slug}
                    href={`/campuses/${campus.slug}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="block text-base text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {campus.name}
                  </Link>
                ))}
              </div>

              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-light border border-primary/60 text-white font-heading font-extrabold text-xs tracking-[0.12em] uppercase shadow-lg block mt-2"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { campuses, sections } from "@/lib/school-data";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Admissions", href: "/admission" },
  { name: "Student Life", href: "/student-life" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [activeCampus, setActiveCampus] = useState<string | null>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

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
          ? "bg-background/95 md:bg-background/45 md:backdrop-blur-lg border-b border-border/40 shadow-xl"
          : "bg-transparent border-b border-transparent shadow-none"
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Basaer Model School"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
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

          {/* Campuses Dropdown with Nested Sections */}
          <div
            className="relative"
            onMouseEnter={() => setIsCampusOpen(true)}
            onMouseLeave={() => { setIsCampusOpen(false); setActiveCampus(null); }}
          >
            <button className="flex items-center gap-1.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              Campuses <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isCampusOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isCampusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full bg-background/95 backdrop-blur-md border border-border rounded-2xl p-2 shadow-xl z-50 overflow-visible"
                >
                  {campuses.map((campus) => (
                    <div
                      key={campus.slug}
                      className="relative group"
                      onMouseEnter={() => setActiveCampus(campus.slug)}
                      onMouseLeave={() => setActiveCampus(null)}
                    >
                      <Link
                        href={`/campuses/${campus.slug}`}
                        className="flex items-center justify-between gap-6 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors whitespace-nowrap"
                      >
                        <span>{campus.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-50" />
                      </Link>

                      <AnimatePresence>
                        {activeCampus === campus.slug && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-full top-0 ml-2 w-56 bg-background/95 backdrop-blur-md border border-border rounded-2xl p-2 shadow-xl z-50"
                          >
                            {sections.map((section) => (
                              <Link
                                key={section.slug}
                                href={`/campuses/${campus.slug}/${section.slug}`}
                                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors"
                              >
                                {section.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Portal & Theme Toggle */}
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
                href="/admission"
                className="relative px-7 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-light border border-primary/30 text-white font-heading font-extrabold text-xs tracking-[0.12em] uppercase transition-all duration-300 z-10 block"
              >
                Apply Now
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

              {/* Mobile Campuses & Sections */}
              {campuses.map((campus) => (
                <MobileCampusBlock key={campus.slug} campus={campus} onClose={() => setIsMobileOpen(false)} />
              ))}

              <Link
                href="/admission"
                onClick={() => setIsMobileOpen(false)}
                className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-light border border-primary/30 text-white font-heading font-extrabold text-xs tracking-[0.12em] uppercase shadow-lg block mt-2"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileCampusBlock({ campus, onClose }: { campus: typeof campuses[0]; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-lg font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <span>{campus.name}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-4 space-y-2"
          >
            {sections.map((section) => (
              <Link
                key={section.slug}
                href={`/campuses/${campus.slug}/${section.slug}`}
                onClick={onClose}
                className="block text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {section.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

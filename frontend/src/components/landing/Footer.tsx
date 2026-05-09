"use client";

import Link from "next/link";
import Image from "next/image";
import { Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-border bg-surface-container-low text-text-secondary pt-20 pb-10 overflow-hidden">
      {/* Background aurora blurs */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-aurora-purple rounded-full filter blur-[100px] opacity-15 -z-10" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-aurora-blue rounded-full filter blur-[100px] opacity-10 -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand details */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
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
            <p className="text-text-secondary leading-relaxed text-sm font-medium">
              Basaeer Model School — bridging the gap between world-class academic excellence and profound spiritual growth.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface-container border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all hover:scale-105"
                  aria-label={label}
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-base mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "Student Portal", href: "/login" },
                { name: "Admissions", href: "/admission" },
                { name: "Careers", href: "/careers" },
                { name: "FAQ", href: "/faq" },
                { name: "Contact", href: "/contact" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <Link href={href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-all group-hover:scale-125" aria-hidden="true" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community & Academics */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-base mb-6">Community</h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "Alumni Association", href: "/alumni" },
                { name: "Media Gallery", href: "/gallery" },
                { name: "News & Events", href: "/news" },
                { name: "Tahfeez Academy", href: "/academics/tahfeez" },
                { name: "Islamic Studies", href: "/academics/islamic-studies" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <Link href={href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-all group-hover:scale-125" aria-hidden="true" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-base mb-6">Newsletter</h3>
            <p className="text-sm leading-relaxed mb-6 font-medium">
              Stay updated with our latest news and events.
            </p>
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-surface-container border border-border rounded-full py-2.5 px-5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Subscribe"
              >
                <Send size={14} className="text-white ml-0.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs opacity-60">
          <p>© 2024 Basaeer Model School. Seeking Knowledge, Illuminating Souls. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

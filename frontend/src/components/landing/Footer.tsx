"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-border bg-surface-container-low text-text-secondary pt-20 pb-10 overflow-hidden">
      {/* Background aurora blur glow */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-aurora-purple rounded-full filter blur-[100px] opacity-20 -z-10" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-aurora-blue rounded-full filter blur-[100px] opacity-15 -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: About */}
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
            <p className="text-text-secondary leading-relaxed text-sm">
              Fostering excellence in both worldly knowledge and spiritual growth. Join us in shaping the leaders of tomorrow.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, label: "Follow Basaeer on Facebook" },
                { Icon: Twitter, label: "Follow Basaeer on Twitter" },
                { Icon: Instagram, label: "Follow Basaeer on Instagram" },
                { Icon: Linkedin, label: "Follow Basaeer on LinkedIn" },
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
            <ul className="space-y-4 text-sm">
              {[
                { name: "About Us", href: "/#about" },
                { name: "Admissions", href: "/admission" },
                { name: "Our Programs", href: "/#programs" },
                { name: "Contact Us", href: "/#contact" },
                { name: "Staff Portal", href: "/login" },
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

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-base mb-6">Contact Us</h3>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 shrink-0" size={18} aria-hidden="true" />
                <span>
                  123 Education Street, City Center,<br />
                  Basaeer City, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-primary shrink-0" size={18} aria-hidden="true" />
                <a href="tel:+2348001234567" className="hover:text-primary transition-colors">+234 800 123 4567</a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-primary shrink-0" size={18} aria-hidden="true" />
                <a href="mailto:admissions@basaeer.edu.ng" className="hover:text-primary transition-colors">admissions@basaeer.edu.ng</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-base mb-6">Newsletter</h3>
            <p className="text-sm leading-relaxed mb-6">
              Subscribe to get the latest news and updates from Basaeer.
            </p>
            <form
              className="relative"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
                const button = form.querySelector('button');
                if (emailInput?.value && button) {
                  button.disabled = true;
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/newsletter/subscribe`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: emailInput.value })
                    });
                    if (response.ok) {
                      alert(`Thank you! You have been subscribed.`);
                      form.reset();
                    } else {
                      alert(`Something went wrong. Please try again!`);
                    }
                  } catch (err) {
                    alert(`Unable to subscribe at this moment.`);
                  } finally {
                    button.disabled = false;
                  }
                }
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-surface-container border border-border rounded-full py-2.5 px-5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                aria-label="Subscribe to newsletter"
              >
                <Send size={14} className="text-white ml-0.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} Basaeer School System. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

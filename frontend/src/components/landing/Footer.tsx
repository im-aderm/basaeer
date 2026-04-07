"use client";

import Link from "next/link";
import { School, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export function Footer() {
    return (
        <footer id="contact" className="bg-brand-navy text-brand-cream/80 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 font-bold text-2xl text-brand-cream">
                            <School size={32} className="text-brand-gold" aria-hidden="true" />
                            <span>Basaeer</span>
                        </div>
                        <p className="text-brand-cream/60 leading-relaxed">
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
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-colors hover:text-brand-navy"
                                    aria-label={label}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-cream mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "About Us", href: "/#about" },
                                { name: "Admissions", href: "/admission" },
                                { name: "Our Programs", href: "/#programs" },
                                { name: "Contact Us", href: "/#contact" },
                                { name: "Staff Portal", href: "/login" },
                            ].map(({ name, href }) => (
                                <li key={name}>
                                    <Link href={href} className="hover:text-brand-gold transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full transition-transform group-hover:scale-150" aria-hidden="true" />
                                        {name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-cream mb-6">Contact Us</h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-brand-gold mt-1 shrink-0" size={20} aria-hidden="true" />
                                <span>
                                    123 Education Street, City Center,<br />
                                    Basaeer City, Nigeria
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-brand-gold shrink-0" size={20} aria-hidden="true" />
                                <a href="tel:+2348001234567" className="hover:text-brand-cream transition-colors">+234 800 123 4567</a>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-brand-gold shrink-0" size={20} aria-hidden="true" />
                                <a href="mailto:admissions@basaeer.edu.ng" className="hover:text-brand-cream transition-colors">admissions@basaeer.edu.ng</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-cream mb-6">Newsletter</h3>
                        <p className="text-brand-cream/60 mb-6">
                            Subscribe to get the latest news and updates from Basaeer.
                        </p>
                        <form
                            className="relative"
                            onSubmit={(e) => {
                                e.preventDefault();
                                // TODO: Connect to newsletter endpoint when backend integration is ready
                                const form = e.currentTarget;
                                const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
                                if (emailInput?.value) {
                                    alert(`Thank you! We'll be in touch at ${emailInput.value}`);
                                    form.reset();
                                }
                            }}
                        >
                            <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center hover:bg-brand-gold-dark transition-colors"
                                aria-label="Subscribe to newsletter"
                            >
                                <Send size={18} className="text-brand-navy ml-0.5" aria-hidden="true" />
                            </button>
                        </form>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-8 text-center text-brand-cream/40 text-sm">
                    <p>&copy; {new Date().getFullYear()} Basaeer School System. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

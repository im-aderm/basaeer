"use client";

import Link from "next/link";
import { School, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export function Footer() {
    return (
        <footer id="footer" className="bg-brand-navy text-brand-cream/80 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 font-bold text-2xl text-brand-cream">
                            <School size={32} className="text-brand-gold" />
                            <span>Basaeer</span>
                        </div>
                        <p className="text-brand-cream/60 leading-relaxed">
                            Fostering excellence in both worldly knowledge and spiritual growth. Join us in shaping the leaders of tomorrow.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-colors hover:text-brand-navy">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-cream mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {["About Us", "Admissions", "Our Programs", "Contact Us", "Privacy Policy"].map((item, idx) => (
                                <li key={idx}>
                                    <Link href="#" className="hover:text-brand-gold transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full transition-transform group-hover:scale-150"></span>
                                        {item}
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
                                <MapPin className="text-brand-gold mt-1" size={20} />
                                <span>
                                    123 Education Street, <br />
                                    Knowledge City, State 10001
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-brand-gold" size={20} />
                                <span>+234 800 123 4567</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-brand-gold" size={20} />
                                <span>admissions@basaeer.edu.ng</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-cream mb-6">Newsletter</h3>
                        <p className="text-brand-cream/60 mb-6">
                            Subscribe to get latest news and updates.
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center hover:bg-brand-gold-dark transition-colors"
                            >
                                <Send size={18} className="text-brand-navy ml-0.5" />
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

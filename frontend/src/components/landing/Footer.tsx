"use client";

import Link from "next/link";
import { School, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export function Footer() {
    return (
        <footer id="footer" className="bg-slate-900 text-slate-200 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 font-bold text-2xl text-white">
                            <School size={32} className="text-primary" />
                            <span>Basaeer</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Fostering excellence in both worldly knowledge and spiritual growth. Join us in shaping the leaders of tomorrow.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {["About Us", "Admissions", "Our Programs", "Contact Us", "Privacy Policy"].map((item, idx) => (
                                <li key={idx}>
                                    <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Contact Us</h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-primary mt-1" size={20} />
                                <span>
                                    123 Education Street, <br />
                                    Knowledge City, State 10001
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-primary" size={20} />
                                <span>+234 800 123 4567</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-primary" size={20} />
                                <span>admissions@basaeer.edu.ng</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Newsletter</h3>
                        <p className="text-slate-400 mb-6">
                            Subscribe to get latest news and updates.
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                            >
                                <Send size={18} className="text-white ml-0.5" />
                            </button>
                        </form>
                    </div>

                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Basaeer School System. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

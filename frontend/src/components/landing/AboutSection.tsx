"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
    const features = [
        "Integrated Islamic & Western Curriculum",
        "Dedicated Tahfeez & Quran Programs",
        "Modern Science & Computer Labs",
        "Secure Boarding Facilities (Boys & Girls)",
    ];

    return (
        <section id="about" className="py-20 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Image Grid */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                {/* Placeholders - Replace with actual school images */}
                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm h-48 lg:h-64 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
                                        alt="Library"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm h-40 lg:h-56 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop"
                                        alt="Classroom"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm h-40 lg:h-56 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1628286950266-3d7195f2694b?e=1740927600&v=beta&t=H-8rY8z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5"
                                        alt="Playground"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm h-48 lg:h-64 relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
                                        alt="Quran Study"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decor Elements - Removed for minimal style */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cream text-brand-navy text-sm font-medium">
                            About Basaeer School
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold text-brand-navy">
                            Empowering Students Through <br />
                            <span className="text-brand-gold">Knowledge & Faith</span>
                        </h2>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                            At Basaeer, we believe in nurturing the whole child. Our unique approach combines academic excellence with deep spiritual growth. We provide a supportive environment where students excel in modern sciences while internalizing the timeless values of the Quran.
                        </p>

                        <ul className="grid grid-cols-1 gap-4">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                    <span className="font-medium text-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className="btn-primary">
                            Discover More
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}

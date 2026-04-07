"use client";

import { Star, MessageSquareQuote } from "lucide-react";
import Image from "next/image";

export function TestimonialsSection() {
    const testimonials = [
        {
            name: "Fatima Al-Hassan",
            role: "Parent of Grade 4 Student",
            content:
                "Basaeer has transformed my son. The balance between secular education and Quran memorization is exactly what we were looking for. Highly recommended!",
            avatar: "https://i.pravatar.cc/150?u=fatima",
        },
        {
            name: "Mr. Ibrahim Musa",
            role: "Parent of Boarding Student",
            content:
                "The boarding facilities are safe and disciplined. My daughter is learning independence and leadership skills alongside her academics.",
            avatar: "https://i.pravatar.cc/150?u=ibrahim",
        },
        {
            name: "Mrs. Aisha Bello",
            role: "Parent of Nursery Student",
            content:
                "The nursery staff are so caring. They made my daughter's transition to school so smooth. She comes home happy every single day.",
            avatar: "https://i.pravatar.cc/150?u=aisha",
        },
    ];

    return (
        <section className="py-20 lg:py-32 bg-white relative overflow-hidden border-t border-[#E5E7EB]" aria-label="Testimonials">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy tracking-tight">
                        What Parents Say <br />
                        <span className="text-brand-gold">About Basaeer</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="relative p-8 rounded-xl bg-white border border-brand-sand/30 hover:border-brand-gold/50 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(10,31,68,0.06)]"
                        >
                            <div className="absolute top-8 right-8 text-brand-sand/40">
                                <MessageSquareQuote size={40} aria-hidden="true" />
                            </div>

                            <div className="flex gap-1 mb-6 text-brand-gold" aria-label="5 stars rating">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                                ))}
                            </div>

                            <p className="text-slate-gray text-lg mb-8 leading-relaxed italic">
                                &quot;{testimonial.content}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <Image
                                    src={testimonial.avatar}
                                    alt={`Avatar of ${testimonial.name}`}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover border-2 border-brand-gold"
                                    unoptimized // For pravatar external links
                                />
                                <div>
                                    <h4 className="font-bold text-brand-navy">{testimonial.name}</h4>
                                    <p className="text-sm text-brand-gold font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

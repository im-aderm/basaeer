"use client";

import { Building2, Users, GraduationCap, BookOpen } from "lucide-react";

export function StatsSection() {
    const stats = [
        { label: "Years Experience", value: "14+", icon: Building2 }, // Founded 2010 -> ~14+
        { label: "Students Enrolled", value: "2,500+", icon: Users },
        { label: "Qualified Teachers", value: "150+", icon: GraduationCap },
        { label: "Huffaz Graduated", value: "500+", icon: BookOpen },
    ];

    return (
        <section className="py-20 bg-brand-cream border-y border-brand-sand/30" aria-label="School Statistics">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="text-center group p-6 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                                <div className="text-4xl mb-4 flex justify-center text-brand-gold group-hover:scale-110 transition-transform duration-300 opacity-80 group-hover:opacity-100">
                                    <Icon size={40} aria-label={stat.label} role="img" />
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-extrabold text-brand-navy mb-2 tracking-tight">
                                    {stat.value}
                                </h3>
                                <p className="text-slate-gray font-medium">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

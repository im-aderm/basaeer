"use client";

import { BookOpen, GraduationCap, Gamepad2, Sparkles } from "lucide-react";

export function ProgramSection() {
    const programs = [
        {
            title: "Kindergarten",
            description: "A nurturing environment where curiosity meets foundational learning.",
            icon: <Gamepad2 size={32} />,
            age: "3-5 Years"
        },
        {
            title: "Primary School",
            description: "Building strong academic skills alongside character development.",
            icon: <BookOpen size={32} />,
            age: "6-11 Years"
        },
        {
            title: "Secondary & Boarding",
            description: "Preparation for higher education with disciplined boarding facilities.",
            icon: <GraduationCap size={32} />,
            age: "12-18 Years"
        },
        {
            title: "Tahfeez Program",
            description: "Dedicated Quran memorization track with tajweed mastery.",
            icon: <Sparkles size={32} />,
            age: "All Ages"
        }
    ];

    return (
        <section id="programs" className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                        Our Educational Programs
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Comprehensive learning pathways designed for every stage of your child's growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {programs.map((program, idx) => (
                        <div
                            key={idx}
                            className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                {program.icon}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-3">{program.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                {program.description}
                            </p>

                            <div className="pt-4 border-t border-border mt-auto">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {program.age}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

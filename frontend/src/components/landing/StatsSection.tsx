"use client";

export function StatsSection() {
    const stats = [
        { label: "Years Experience", value: "38+", emoji: "🏛️" },
        { label: "Students Enrolled", value: "2,500+", emoji: "🎓" },
        { label: "Qualified Teachers", value: "150+", emoji: "👩‍🏫" },
        { label: "Huffaz Graduated", value: "500+", emoji: "📖" },
    ];

    return (
        <section className="py-20 bg-[#F9FAFB] border-y border-[#E5E7EB]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center group p-6 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 contrast-0 group-hover:contrast-100 opacity-80 group-hover:opacity-100">
                                {stat.emoji}
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-extrabold text-[#111827] mb-2 tracking-tight">
                                {stat.value}
                            </h3>
                            <p className="text-[#6B7280] font-medium">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

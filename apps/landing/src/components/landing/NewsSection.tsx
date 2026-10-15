"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function NewsSection() {
  const news = [
    {
      category: "CAMPUS NEWS",
      date: "OCT 12, 2024",
      title: "Basser Innovation Hub Opens Its Doors for AI Research",
      image: "/placeholder.svg",
      color: "text-primary-light",
    },
    {
      category: "EVENTS",
      date: "OCT 15, 2024",
      title: "Annual Future-Tech Summit: Global Leaders Speak",
      image: "/placeholder.svg",
      color: "text-secondary",
    },
    {
      category: "ACHIEVEMENTS",
      date: "OCT 20, 2024",
      title: "Basaer Students Win Global Robotics Competition",
      image: "/placeholder.svg",
      color: "text-text-secondary",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Top Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>

      <div className="w-full bg-gradient-to-br from-secondary/5 via-surface-dim/20 to-primary/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-primary-light uppercase mb-1 block">
                LATEST UPDATES
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading">
                News &amp; Insights
              </h2>
            </div>
            <Link href="/news" className="text-primary-light hover:underline font-bold text-sm">
              View All Archive
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden glass-card mb-4 relative aspect-video">
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    alt={item.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    src={item.image}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold tracking-wider ${item.color}`}>
                    {item.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span className="text-[10px] font-bold tracking-wider text-text-secondary/60">
                    {item.date}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-text-primary font-heading group-hover:text-primary-light transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-light/30 to-transparent"></div>
    </section>
  );
}

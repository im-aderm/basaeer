"use client";

import React from "react";
import Link from "next/link";

export function NewsSection() {
  const news = [
    {
      category: "CAMPUS NEWS",
      date: "OCT 12, 2024",
      title: "Basser Innovation Hub Opens Its Doors for AI Research",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRWX5_IQiGyPqUw9hT2WRJNrTYB80qzgUbL4HrQhaRCTwx1PkHqm_1F4E8FKC1C783Tpom8kYi6dkQy6kBgPzWvRBWjHzl-bh6L3BNuSOBzUKsd6EuTDdZQwpUmv37JoYNqrmCMMEyUL7ueVADIiz2HxwuA4Y5sGMXe7TDar8bSEvpQWtns_0k-CxFtHEonT4S8aiYIgAnqDM-dwNe_pqIRNKQ6xyTWCcsPfI5NtRpwxc9gS-euDup7jWc4wnvtluFl8T4gp7DCsU",
      color: "text-[#d2bbff]",
    },
    {
      category: "EVENTS",
      date: "OCT 15, 2024",
      title: "Annual Future-Tech Summit: Global Leaders Speak",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkTwEdfldl-PHjdsnpgpvFJDcM-WaJYGOcN7qzuDGb7UARZhsZfPTUmYFKxtBRgNsFe7ADkgpR8mvahJYKJ-D-vmVkivNCztIuogy7dOUElLYpSuqL6MEyXD7QfEoZvmcJgoGcGQ4YkZmrd-6VyYE6mKFCi3MU76ixdF9dlLiPwvl8Nx9wx1L-uWV36W6srMu6AevauIOQ4-vuRctk1hjEZIhSEmNh7efQmWfmYWvBTRUABurDu1aDPmVvrgRcupXmJH4_m3LbKcE",
      color: "text-[#adc6ff]",
    },
    {
      category: "ACHIEVEMENTS",
      date: "OCT 20, 2024",
      title: "Basser Students Win Global Robotics Competition",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmJY2gyUTYGctl10AIgi3__KspCjsdDJnWsmaussYlww6-9gbigNJmxwHKbIL2FdMQpBfZDa7fRJniT7Q0W2Gs_7jv8DDRouLi9HEK753GesVa-JKuFi5bYKhNMa5COZgn-qMEAMu6jvxvliEDO26JIOIy3N4VzFsWc1q-xF1pSXF4G00PB775EKcL75jp-QTZFFm4KQaJmSIQSjJhdcHMioAPxJIvTmE0f70NeLzXzJ0Rrp4Z6UMm9k0SiweV4IQpNfi8ec7fMPo",
      color: "text-[#c1c5df]",
    },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-[#d2bbff] uppercase mb-1 block">
            LATEST UPDATES
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white font-heading">
            News &amp; Insights
          </h2>
        </div>
        <Link href="/news" className="text-[#d2bbff] hover:underline font-bold text-sm">
          View All Archive
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.map((item, idx) => (
          <div key={idx} className="group cursor-pointer">
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4 relative aspect-video">
              <img 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" 
                src={item.image} 
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold tracking-wider ${item.color}`}>
                {item.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-[10px] font-bold tracking-wider text-[#ccc3d8]/60">
                {item.date}
              </span>
            </div>
            <h4 className="text-xl font-bold text-white font-heading group-hover:text-[#d2bbff] transition-colors leading-snug">
              {item.title}
            </h4>
          </div>
        ))}
      </div>
    </section>
  );
}

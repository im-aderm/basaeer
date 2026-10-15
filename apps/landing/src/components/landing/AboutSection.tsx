"use client";

import React from "react";
import { Compass, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function AboutSection() {
  const cards = [
    {
      title: "Our Mission",
      desc: "To cultivate an environment where intellectual curiosity is fueled by cutting-edge technology, fostering leaders grounded in wisdom and ready for a digital future.",
      icon: <Compass className="w-8 h-8 text-accent-gold" />,
    },
    {
      title: "Our Vision",
      desc: "To become the global gold standard for hybrid education, seamlessly integrating traditional humanistic values with the boundless possibilities of innovation.",
      icon: <Eye className="w-8 h-8 text-accent-gold" />,
    },
    {
      title: "Core Values",
      desc: "Integrity, Faith, and Academic Excellence form the cornerstones of our community, empowering students to lead with moral clarity and intellectual courage.",
      icon: <ShieldCheck className="w-8 h-8 text-accent-gold" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 100, damping: 15 } 
    }
  };

  return (
    <section id="about" className="relative w-full overflow-hidden">
      {/* Top Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-light/30 to-transparent"></div>

      <div className="w-full bg-gradient-to-br from-primary/5 via-surface-dim/30 to-secondary/5 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column (Copy) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="lg:col-span-4 space-y-6 text-left"
          >
            <span className="text-xs font-bold tracking-[0.2em] text-primary-light uppercase block">
              OUR FOUNDATION
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary font-heading leading-tight">
              Raising Future Leaders...
            </h2>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed font-medium">
              We are dedicated to providing a comprehensive educational sanctuary where academic brilliance, spiritual development, and future-ready innovation converge.
            </p>
          </motion.div>

          {/* Right Column (Cards with Staggered Entrance) */}
          <div className="lg:col-span-8 relative">
            {/* 3-Card Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {cards.map((card, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-background border border-border/60 hover:border-primary-light/30 shadow-sm hover:shadow-md p-8 rounded-[32px] flex flex-col items-center text-center relative min-h-[350px] justify-between group transition-all duration-300"
                >
                  <div className="space-y-6 flex flex-col items-center">
                    {/* Circle Background containing the Icon */}
                    <div className="w-16 h-16 rounded-full bg-surface-container/60 flex items-center justify-center border border-border/40 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {card.icon}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-wide uppercase font-heading text-text-primary">
                        {card.title}
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed font-medium">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  {/* Circular action button overlapping the card bottom border */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center border-2 border-background shadow-lg group-hover:bg-secondary group-hover:scale-110 transition-all duration-300 cursor-pointer">
                    <ArrowRight size={14} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
    </section>
  );
}


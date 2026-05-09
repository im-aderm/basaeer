"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  Mail, 
  Phone, 
  BookOpen, 
  UserCheck, 
  GraduationCap, 
  Info 
} from "lucide-react";

const faqData = [
  {
    category: "Admissions",
    icon: UserCheck,
    items: [
      {
        q: "What are the age requirements for enrollment?",
        a: "For Kindergarten, children must be 4 years old by September 1st. For Grade 1, the requirement is 6 years of age. We follow a strict age-appropriate placement policy to ensure social and emotional readiness.",
      },
      {
        q: "Are there scholarships available for talented students?",
        a: "Yes, Basaeer Model School offers Merit-Based Scholarships for students excelling in academics and the Tahfeez program. Financial aid is also available through our Zakat-funded scholarship pool for eligible families.",
      },
    ],
  },
  {
    category: "Academics",
    icon: GraduationCap,
    items: [
      {
        q: "What curriculum does Basaeer follow?",
        a: "We integrate the rigorous British International Curriculum (Cambridge) with our proprietary Islamic Integrated Science program, ensuring students are competitive globally while remaining spiritually grounded.",
      },
    ],
  },
  {
    category: "Tahfeez Academy",
    icon: BookOpen,
    items: [
      {
        q: "Is the Tahfeez program integrated into the daily schedule?",
        a: "Yes, we offer two paths: Full-time Tahfeez (with core academics) and Integrated Tahfeez (morning sessions). Both options are led by certified Qaris with a focus on Tajweed and memorization retention.",
      },
    ],
  },
  {
    category: "General",
    icon: Info,
    items: [
      {
        q: "Does the school provide transportation?",
        a: "Basaeer provides air-conditioned transportation services covering a 20km radius around all campuses. All buses are equipped with real-time GPS tracking and trained supervisors.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    if (openIndex === key) {
      setOpenIndex(null);
    } else {
      setOpenIndex(key);
    }
  };

  // Filter FAQ items based on search query
  const filteredFaqs = faqData.map((cat) => {
    const matchedItems = cat.items.filter(
      (item) => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      items: matchedItems,
    };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section & Search */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-center space-y-6 mb-16">
          <span className="text-xs font-bold text-[#d2bbff] tracking-[0.3em] uppercase block">
            KNOWLEDGE BASE
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading">
            Your Questions, <span className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Answered.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
            Find comprehensive information about our curriculum, admissions process, and the spiritual journey at Basaeer Model School.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-4">
            <div className="bg-white/5 border border-white/10 rounded-full flex items-center px-6 py-3 focus-within:ring-2 focus-within:ring-[#7c3aed]/50 focus-within:border-[#7c3aed] transition-all duration-300">
              <Search className="text-[#d2bbff] shrink-0 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search for 'Admissions' or 'Scholarships'..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-white/20 outline-none text-sm md:text-base"
              />
              <button className="bg-[#7c3aed] text-white px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-transform hover:scale-105">
                FIND
              </button>
            </div>
          </div>
        </section>

        {/* Categorized Accordions */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-16 space-y-12">
          {filteredFaqs.map((cat, catIdx) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.category} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <CatIcon className="text-[#d2bbff]" size={24} />
                  <h2 className="text-2xl font-bold text-white font-heading">
                    {cat.category}
                  </h2>
                </div>

                <div className="space-y-4">
                  {cat.items.map((item, itemIdx) => {
                    const uniqueKey = `${catIdx}-${itemIdx}`;
                    const isOpen = openIndex === uniqueKey;

                    return (
                      <div 
                        key={item.q}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#7c3aed]/40 transition-colors duration-300"
                      >
                        <button 
                          onClick={() => toggleAccordion(uniqueKey)}
                          className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none"
                        >
                          <span className="font-bold text-white font-heading text-base md:text-lg">
                            {item.q}
                          </span>
                          <ChevronDown 
                            className={`text-[#d2bbff] transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`} 
                            size={20} 
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 text-sm md:text-base text-[#ccc3d8] border-t border-white/5 pt-4 leading-relaxed">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
              <HelpCircle className="text-[#7c3aed]/40 mx-auto mb-4" size={48} />
              <p className="text-lg text-[#ccc3d8]">No FAQs matched your search term.</p>
            </div>
          )}
        </section>

        {/* Final Support Support CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
          <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-16 text-center border-2 border-[#7c3aed]/10 relative overflow-hidden space-y-6 group">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-[80px] group-hover:bg-[#7c3aed]/20 transition-all duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#4f46e5]/10 rounded-full blur-[80px] group-hover:bg-[#4f46e5]/20 transition-all duration-700"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
                Still have questions?
              </h2>
              <p className="text-lg text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
                Our admissions team is available Sunday through Thursday to assist you with any inquiries regarding the enrollment process.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button className="px-8 py-4 rounded-full text-white font-bold bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <Mail size={18} /> Contact our team
                </button>
                <button className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <Phone size={18} /> Request a Call
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

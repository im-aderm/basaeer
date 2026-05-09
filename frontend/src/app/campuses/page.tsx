"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  MapPin, 
  ArrowRight, 
  Users, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Compass, 
  Dribbble, 
  Flame,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const stats = [
  { value: "2,500+", label: "Enrolled Students", color: "text-[#7c3aed]" },
  { value: "450+", label: "Graduate Huffaz", color: "text-[#adc6ff]" },
  { value: "12", label: "Modern Laboratories", color: "text-[#7c3aed]" },
];

const campuses = [
  {
    name: "Ikeja City Campus",
    description: "Our flagship urban center featuring high-tech robotics labs and a central auditorium for spiritual gatherings.",
    students: "1,200",
    core: "Smart Classrooms",
    coreLabel: "Tech Core",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALRTCxyrEcI9CptBASdnjR5uGzd9dDwIrEBJaNETk4_cJtSm2vG50WwNHjUmCRYs9YSO86wv8MH-Y-apVkySYq3uuZq8tqQ7DH_R1c2KlPV8Ut0iM-1jltvVZEEQh1y8wk0qRhlTgNkkJYJHig9QYfw6SexkpDnZK3rkRDhHSoVSjX7KTWl9KL2siAw3OSnsvmN8OEu9Z-itEnMKy8vpYdPcRDHwHRV0Ty_BEFIOojgGmHKJYr51hrr_26_kR5nPj8OvTcrXok-3o",
  },
  {
    name: "Victoria Island",
    description: "A coastal sanctuary designed for advanced science research and personalized Quranic memorization programs.",
    students: "850",
    core: "Bio-Labs",
    coreLabel: "Focus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1XcmuowekSzkJWXNd7HL5yRXKonl8ZI7TU4ORztfKtGsAE0wGehdBkwxD8l1rAsue4FsFESbNk5LON0KYo-xyvNhdphgszoYGH3OEPDRDufvIYG-ONHvP57AiTvOAY5DYkeIX-1aaJHkrNFzc2-Fl83dgE3jFSd81e0WAxniFu8I3Pb-LVXkzcvOuIZNJZ7mj8G6AnMuCpKeJiD-WxTisAWj_mB9QxV-8TP8ySuAY7pHg1qSpC9tAzgoUV5X7YKbAKexaNYueynk",
  },
  {
    name: "Abuja Heights",
    description: "Our premier residential campus nestled in the hills, offering an immersive spiritual and academic retreat.",
    students: "450",
    core: "Hostels",
    coreLabel: "Type",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8xxuqHU0_3RACnICqto2dKhEq2ms99kvELje-BvgolohGc4FdX3nzcr-IeaIs-28R9n-hx3vTPzKenXxnh3Tk6w2R6ZPQNsRj5mLAo0jlGz-QylKIRVAlIiuRE4VXQYnsn5cirMkqCZ5XH8Ov-RhfPHEZwZlYIavHwswx1XHRToc5UjA6A6xKQTe3j8Q9mkGZLvx2KaQAOCvW3zltwGzx4bWpAe-bUObD0xkjFioB4s9QPYALme8ItosGvzD0WW-nqQjhBN9blEg",
  },
];

const facilities = [
  {
    title: "Advanced STEM Labs",
    description: "Equipped with the latest research tools for physics, chemistry, and molecular biology.",
    icon: Compass,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBhzaub5iCa_HPhBEWNleI5PEnd-z6uyfCNFFgPKK-1r98t4KDrAVFOwkdMn7tbs0lkOth283tVgWPzHFRV0-jzG4WQiFfJpj3JDH5GYzfqoGRFJ1vyN-nIl5VB6NcITDT_97dwye9tocyIVKo9hSN2BoBdZr1LLHAedBT3SFqV7XJOv3nSJGrR2Bb5HNRhFwUhSxLK0tNRqsPjn5W1T3VLm_1bPMCnzVivcqacN94x7BrNB1Qw_2goc2jBzTfIFspa5ydU9V9ykI",
  },
  {
    title: "The Wisdom Hall",
    description: "A multi-story library housing over 20,000 titles including rare Islamic manuscripts and digital archives.",
    icon: BookOpen,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8s2XWcZqMPmAOxpxVPuC9S3G3dSuQEIRBHL_9UEmnRi3x2Qyr5T3aIUlicRJjIsSG_7ALfnb85bNFFt3xq9ORkmrEzO6brCNmKfhm9gFHATGLKW2piXAlKYBgqEpSsq2xTFMqaxSHFLKtoRMusDuf03ZTQFDmiXJiPOLOrKncz9BHmjriS9nLNmYwlUeRm2zWxfOzgQ5wQaitbJIABnUqMgmmJBXMEJErEWl6mF9BQIe2z27GcawNO6p2VyS-F0T470gANPoTklg",
  },
  {
    title: "Spiritual Sanctuary",
    description: "A serene space for daily prayers and evening Dhikr, designed with acoustic perfection for Quranic recitation.",
    icon: Flame,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaLHcwebgFOyLKOTpoOE0ajbvQDSikQwLfXj9hzKjDnglFB686vYeeHuQwTJASnl2yomoAH256tcT-z3yqLCKn96FYwoEpdTQgmzUeqZPPC6v7qNwN71pX63OFDsA0_1QL2Ljo4fsGa1GrKJ0xc2QiTtY8LaY161LfltuJZOiW4mGEgwsuhDcoz8NVPJCmogSMibfyw4nM7JWpDABEzPR8yNmeUryEzk-qetN3uiowNc63IIrrjzfkYdNwjiY4SP0bHjdrO9DRHOM",
  },
  {
    title: "Elite Sports Complex",
    description: "Olympic-standard facilities for basketball, swimming, and indoor track and field events.",
    icon: Dribbble,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBj5-NRZC3HKeIf5Zjkxfr5MwE52xIMUKIfzN-IclXPeF_0QK6SV6RoN2geKqIJ-zdY0wNHJXwfuj4vQ838734OnmgrtxPbHW9hnHpioBqRtN9z99N-5MBkN71Ll78Jz1WGvtWunC3dP4rtoiDYTnUJyVKCQuTvfs3a-_x7L_uDsfrh6CXpBjl4Ai9hQNk9AWGUvAz6f8CkC4Sam8VVWCFRJG9Rw1asOJ3CkaIngG5x7EVK5Co_fd-jwaXDAOCOl9L5Q29Pn6lRD5w",
  },
];

export default function CampusesPage() {
  const [activeFacility, setActiveFacility] = useState(0);

  const nextFacility = () => {
    setActiveFacility((prev) => (prev + 1) % facilities.length);
  };

  const prevFacility = () => {
    setActiveFacility((prev) => (prev - 1 + facilities.length) % facilities.length);
  };

  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#d2bbff] tracking-[0.2em] uppercase">
              VISIONARY EDUCATION
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
              A Network of Excellence: <span className="text-[#d2bbff] drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">Our Campuses</span>
            </h1>
            <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed">
              Discover our strategically located campuses designed to provide a serene, technologically advanced environment for spiritual and academic growth.
            </p>
          </div>
        </section>

        {/* Campus Statistics */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/5 backdrop-blur-md rounded-3xl p-8 lg:p-12 text-center border border-white/10 shadow-2xl">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className={`space-y-2 ${
                  index === 1 ? "md:border-x border-white/10 py-4 md:py-0" : ""
                }`}
              >
                <div className={`text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#ccc3d8] uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Campus Cards */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campuses.map((campus) => (
              <div
                key={campus.name}
                className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden group border border-white/10 hover:border-[#7c3aed]/50 hover:shadow-2xl hover:shadow-[#7c3aed]/10 hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    alt={campus.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={campus.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15121b]/80 to-transparent"></div>
                </div>
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-white font-heading">
                        {campus.name}
                      </h3>
                      <MapPin className="text-[#d2bbff] w-5 h-5 shrink-0 mt-1" />
                    </div>
                    <p className="text-[#ccc3d8] text-base leading-relaxed">
                      {campus.description}
                    </p>
                  </div>
                  <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-white font-extrabold font-heading text-lg">{campus.students}</div>
                        <div className="text-xs text-[#ccc3d8] uppercase tracking-wider font-semibold">Students</div>
                      </div>
                      <div>
                        <div className="text-white font-extrabold font-heading text-lg">{campus.core}</div>
                        <div className="text-xs text-[#ccc3d8] uppercase tracking-wider font-semibold">{campus.coreLabel}</div>
                      </div>
                    </div>
                    <button className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-[#7c3aed] hover:border-transparent hover:text-white transition-all duration-300 flex justify-center items-center gap-2">
                      Explore Campus <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integrated Map View */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="relative h-[500px] w-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
            <img
              className="w-full h-full object-cover grayscale brightness-50"
              alt="A stylized dark-mode digital map"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz2PVipmfEzDcAyjvoMp08FDMpy1nmugVLvXWFPOOiBTE990Fq8qITEvTr8AHF6Zdk35CJApDG84SOsE5gW0_MgC9uTdc3_Cad_xOv-CM9tRWSOUY6tkYKWEgE2E0jnVUOjwKUA9iDgbdPH1aicltF8yalOk7dBUYh1E3GgXbuh--qm4U4Te_2761ubYidyjSinSIHClTPJuNWvt6EQWlq8ecabn8X1EdfhasDVBH38serze2CmkRCOUlebqgWyJiOUUyEchNKCgU"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-transparent to-transparent"></div>
            
            {/* Floating Info Overlay */}
            <div className="absolute top-8 left-8 p-8 bg-[#15121b]/80 backdrop-blur-md border border-white/10 rounded-3xl max-w-sm hidden md:block space-y-4">
              <h4 className="text-xl font-bold text-[#d2bbff] font-heading">Campus Network</h4>
              <p className="text-[#ccc3d8] text-sm leading-relaxed">
                Our centers are strategically positioned to serve major hubs, ensuring proximity and accessibility for our growing community.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] animate-pulse"></span>
                  <span className="text-white text-sm font-medium">Lagos Central Hub</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#adc6ff]"></span>
                  <span className="text-white text-sm font-medium">Abuja Regional Center</span>
                </div>
              </div>
            </div>

            {/* Glowing Pin Overlays */}
            <div className="absolute top-1/2 left-1/3 w-8 h-8 -ml-4 -mt-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-[#7c3aed] border-4 border-white/20"></span>
            </div>
          </div>
        </section>

        {/* Facilities Showcase */}
        <section className="py-8 mb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[#adc6ff] font-label-caps tracking-widest uppercase block mb-2">
                  WORLD CLASS
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
                  Premium Facilities
                </h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={prevFacility}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#7c3aed] hover:border-transparent transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextFacility}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#7c3aed] hover:border-transparent transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto px-6 lg:px-8 pb-8 no-scrollbar max-w-7xl mx-auto">
            {facilities.map((fac, idx) => (
              <div
                key={fac.title}
                className={`min-w-[320px] md:min-w-[400px] bg-white/5 backdrop-blur-md rounded-3xl p-4 group cursor-pointer border transition-all duration-300 ${
                  idx === activeFacility 
                    ? "border-[#7c3aed]/50 shadow-[0_0_25px_rgba(124,58,237,0.15)]" 
                    : "border-white/10 hover:border-[#7c3aed]/30"
                }`}
              >
                <div className="h-64 rounded-2xl overflow-hidden mb-6 relative">
                  <img
                    alt={fac.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={fac.image}
                  />
                </div>
                <div className="px-2 pb-2 space-y-2">
                  <h4 className="text-xl font-bold text-white font-heading group-hover:text-[#d2bbff] transition-colors">
                    {fac.title}
                  </h4>
                  <p className="text-[#ccc3d8] text-sm leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

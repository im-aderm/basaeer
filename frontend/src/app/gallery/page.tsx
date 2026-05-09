"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, 
  ArrowRight, 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Compass,
  ArrowRightLeft,
  Tv,
  Users
} from "lucide-react";

const categories = ["ALL REELS", "FACILITIES", "ACADEMICS", "STUDENT LIFE", "GRADUATIONS", "TAHFEEZ"];

const galleryItems = [
  {
    id: 1,
    category: "ACADEMICS",
    title: "Innovation Lab Sessions",
    description: "Students engaged in collaborative high-tech laboratory projects with digital simulations.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvSgMfZsdWLFUQDbA4Jw93m0LltG0QYK0pno8Mmmq2GszLCIEPaqobUE26PoQs3nSuD4wntHHvlPiVyWdU18--Sk5vb71rbdHZ-7A7FjcfGPC55tbiZ38xUYrAERWmuH6cdKlG5uLLEqQX21SQkbJrjuhKEKAoLsHvEnAy7bZjDsSgb_6pmu7wOI_VHADcQBfR8AHc2JOcZ9nzJe4PT0vbRAP-JHUVXmotWDptsvtBMg7xGy95THj50hq-rFGHsxYHv-2tGXGYHfg",
  },
  {
    id: 2,
    category: "FACILITIES",
    title: "The Great Wisdom Hall",
    description: "Our grand school library with towering bookshelves, digital catalogs, and quiet study pods.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuw5JoppYtrjFtyKEEZTj-MHtiFunIs_td0YfJ7vwwnwbRGuOp7jsMLQ3g9fI9MTRkZRcs9pNqUx1qlItRYB9UjukMlP2cl7nLCxMuyg2vRih3ACCeoz_MS_8QHc3haErUyW7ZPZQFfToY38puq6fgt4Wyx-TJ3KkKiWumBM1nbBNpRnpoD3Ny69PYUIXhkZamoHTLBE2CVRyLpYmasHMF2_4aHWClEf5VR2WKUFBRgceS1H1imr7KASjIgiq1Fo8u6jaQyBKH2Wdo",
  },
  {
    id: 3,
    category: "GRADUATIONS",
    title: "Class of 2024 Ceremony",
    description: "Celebrating academic success and futures illuminated by shared knowledge.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWBOc5IwTpb7zw_cyEhtx2aDZRbeEuzu7Jv67FUrre-JtUcH-sGf6D4jl6bWi6Ium5p8RKiKso5aBCD1EnK7Vdx14mZvm6fCXHatFbchGEA6SPXTGNv955w4vy1UQ_g8y9F-6sh5pc0-_IePemkXk-ALD2GdW3AUjo-wJeFG6oh8aHGDf--WO7vOWYOylN9MN4vNpcR9dGgq0y1L45p5U95vT4AYU791yNUH7R-huY8LXMHXwePXuInU36n6xBDzgWQ2K4118S1h4",
  },
  {
    id: 4,
    category: "TAHFEEZ",
    title: "Spiritual Sanctuaries",
    description: "Peaceful prayer and memorization spaces detailed with beautiful Islamic architecture.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs1EYviRUQXuqOeTVKvLdit0aVxTJAzhGxM60kic8t2ViVrtrWysvDLOa0Mc6PYMQF-SIq9cIGDayVduv9xFn3tNJoWXOd-wzqvgsIW-ETuurpOpXD7CS7E2YClGsQwfo51p0bT-Rmxt9iYtoiCVIsZlfYGCRLgx5TJIsPiHdC31LHgcyPpDGPiD3B1uKnd0hiY5-FOzK2zEEOcr1VEWcFL3Pk_aWrDAYJBei2e0giJomz9qYJ4m47q8x8Y7vmSx9pVT0ruUvbYO8",
  },
  {
    id: 5,
    category: "STUDENT LIFE",
    title: "Interactive Social Hubs",
    description: "Modular high-energy lounge areas for student collaborations and clubs.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATMf2_olmEI0IE7mgi1BpFYDlpkU1FdXrNS4y1q9dFVdndhCC6y15fBNpD6OlZHE4Z-S0wav7vSIgok9ztZwfEZpyzjNa4wZQe-1_lJOlLFRXwMx5fJGKO8gfJtBJYpSXQQ9Nf9E8hKh6CkhhMBD9vlBRXo3dhMxLv2CidDRFV1zQjZu8QIju-mxThoXFoNYEVtl5aS3YphJKWCOjGfuosdrcd-hya5Uahznlj6IlelmRHX6tsawlh4JWxxwnFGam16-wW13HUF1c",
  },
  {
    id: 6,
    category: "FACILITIES",
    title: "The Visionary Theater",
    description: "Fully interactive immersive auditorium equipped for visual presentations and ceremonies.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdworstILxdRYw8-Oi4s58ctT4FFkZIjLMHw-ZeymM4gqy9qIal-lkekY90D4ACiJts2pfdlwwAESlyWTccQoi1OIdZnP7tNvo9nhEUgOBO4TtPWXf7phG14we0plmJzqXQ0aLEX2CwEB1P7vZoYXiuqH3R19yysjaJRdZnD0w5EfI5O4emvx434tmU8OWqwC-xR5ohhYQe6XTjSNJUKpk3cdZlzbPxAKv54eGJZ5M6Jc-YobbhluKdjcP5R7z0vjYJRjMESK2e_Q",
  },
];

const videos = [
  {
    title: "Cultural Heritage Festival",
    desc: "A celebration of global diversity and shared values through art and performance.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2dsKRXWUvGii2eEv-yFrzPvIu6UbYn8taSZzThQ8hLDcT0ZWt6hljtbrOtEZQMPs6eb1xGzxa2nqaMH3vVP5Z_pVs1vhqO2FgbwEt5BWrXorrDD1Ac7KaGtQK2mhgHxvAsF1vHNdrw7JWFfG5UX_4lcEYQyc2kh13IiQdmByDhEhuREl9GjupadnGrfd7HH2DLEtHyLSh4osG5V-49Th3s6NSdhn5bdvPuA_zSfVtUNDsO1IhLzLyPgxgE73q6_RGnMjwOoe2pOI",
  },
  {
    title: "Athletic Excellence Highlight",
    desc: "Pushing boundaries and building resilience in our state-of-the-art sports complex.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARqxa0S53RjmDnnwUENO29wGoQN6SNZyXZVzCXDm4cE3xNN4hIyRUTNXDhaQWXrqgDyyhMj8USVS5El9tV4wb8BWQSYRFcUZsvddGcwsBjPfruY5xZTOFxkOTuxes7zHCr11JUJZhCoccva_BYRKybhl9U82AlkLKxb_0ShB9axVV4ASjgcxQdg0_tgqVAPLG9Qik6qM811kNXfNnOCjx4k0qDai1UQhmnEgFKKY0sskNltC01mfSI4hLY5FValhYbhUIoU2qqLyA",
  },
  {
    title: "Tahfeez Program Journey",
    desc: "Exploring the spiritual path of our Quranic memorization students.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxZNn3QLOEcjwEUtPNoO1Ktf0xeTnOzsN_6wTtD60KvxLKutEJivSlzldY9DAvmtkQTTKR3qqi9Lm0AU2DERZ0B79eNLZtGffTkeaHld8OEV5coy4dOGawd4m7XoHVSjerjxKkk08Lo7M42i-n-Blks8da8M-KBNrEJM4CZadKfNjbr0ExcpSv4Ia5oFN7vufaoRaGf-MRy27Bv8fSLKNUSA6dJ4vHVTd9X7SvrEj83S8_3JhLzBXFBCsFNHwn47PA1K1DJjzJE0Q",
  },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("ALL REELS");

  const filteredItems = galleryItems.filter(
    (item) => activeTab === "ALL REELS" || item.category === activeTab
  );

  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main>
        {/* Hero Section with Large Image Overlay */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Basaeer Model School Campus Aerial view" 
              className="w-full h-full object-cover opacity-40 scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6vSiHLvFFNlLHTetHlo9YmafxgkxudKSrpvMKskby773D7Dz2B4pIego7KjZLwYqW9XvHmYb1UZDUcy9zDNjLNnHouuFdx_T378xUiUw1OyS6T5F1iBlENSemDj2pwywWzV4fEJHoVMxHMAfry-wrXNeyfSy3Q05K2uaKZmu1xbSLRkWhF22Ft6oF_eZOTlZoBhSd6L1T73M1FVyNdFFGEh9dK3C4McigdXP3n9HQA1lXEs-3Y4X9D3J51q_2kG85ShnKMOsoY4Q" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#15121b]/0 via-[#15121b]/40 to-[#15121b]"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-4xl space-y-6">
            <span className="text-xs font-bold text-[#d2bbff] tracking-[0.3em] uppercase block">
              VIRTUAL CHRONICLE
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading">
              Windows into our World: <span className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)] block md:inline">Campus Life in Focus.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
              Witness the fusion of tradition and technological progress through our immersive visual journey.
            </p>
          </div>
        </section>

        {/* Visual Categories Filter */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-12 relative z-20">
          <div className="flex flex-wrap justify-center gap-3 py-6 border-b border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeTab === cat
                    ? "bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-[#7c3aed]"
                    : "bg-white/5 text-[#ccc3d8] border border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Masonry Gallery with Filter Transition */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <motion.div 
            layout 
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.id}
                  className="relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] transition-all duration-500 flex flex-col break-inside-avoid"
                >
                  <img 
                    alt={item.title} 
                    className="w-full h-auto rounded-t-3xl grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    src={item.image} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-[#15121b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-white font-heading">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#ccc3d8] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Video Highlights */}
        <section className="py-24 bg-[#100d16]/40 backdrop-blur-md relative overflow-hidden mb-16 border-t border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl space-y-3">
                <span className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase block">
                  CINEMATIC REELS
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
                  Experience the Basaeer Journey in Motion.
                </h2>
              </div>
              <button className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase flex items-center gap-2 group hover:text-white transition-colors">
                VIEW CHANNEL <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Featured Video Card */}
              <div className="group relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#7c3aed]/40 transition-all duration-500 cursor-pointer">
                <img 
                  alt="Modern STEM Robotics competition film frame" 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAguupNy3snl6-ExRNOBsI6aC3NvUR5V_SfEqMcYcRRb6Y1XuhTm-2C1vIyWjlni4Y5vkafQsLxERqLGuz7YC8DmMdELPoiE4_ydnIs4ikVzJRxppMJNM2qAxbyUS0HRPkZVnSAg0R-7xIXJp-t21PI_R1pNtP2o3naGnyX1fp2f5-zKUSDKyZkKiRyrJSuXq1yvCEaqwtV9zS6kFafaQvKjpttdCGTO1Zke7XO12bs-8exaDaByXvmbQiR9M1imv-eszN3G1YUy9o" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#7c3aed]/20 backdrop-blur-md border border-[#7c3aed]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                    <PlayCircle size={40} className="text-[#d2bbff]" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-[#d2bbff] font-bold text-xs tracking-wider uppercase mb-1 block">
                    FEATURED FILM
                  </span>
                  <h4 className="text-2xl font-bold text-white font-heading">
                    Innovation &amp; Spirit: The 2024 Showcase
                  </h4>
                </div>
              </div>

              {/* Secondary Videos List */}
              <div className="space-y-6">
                {videos.map((vid) => (
                  <div 
                    key={vid.title} 
                    className="flex flex-col sm:flex-row gap-6 bg-white/5 p-4 rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/10 hover:border-[#7c3aed]/30 transition-all duration-300"
                  >
                    <div className="relative w-full sm:w-48 h-32 shrink-0 rounded-2xl overflow-hidden">
                      <img 
                        alt={vid.title} 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        src={vid.image} 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle size={24} className="text-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <h5 className="text-lg font-bold text-white font-heading group-hover:text-[#d2bbff] transition-colors">
                        {vid.title}
                      </h5>
                      <p className="text-sm text-[#ccc3d8] leading-relaxed line-clamp-2">
                        {vid.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tour Booking CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-16 text-center border-2 border-[#7c3aed]/10 relative overflow-hidden space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
              Want to see it in person?
            </h2>
            <p className="text-lg text-[#ccc3d8] leading-relaxed max-w-2xl mx-auto">
              Schedule a personalized campus tour and experience the future of education firsthand.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
                BOOK A TOUR
              </button>
              <button className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                VIRTUAL OPEN DAY
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

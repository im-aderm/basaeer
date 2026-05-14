"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ExternalLink, 
  Calendar, 
  Share2, 
  Heart, 
  MessageSquare, 
  Plus,
  Sparkles,
  BookOpen,
  MapPin,
  Clock
} from "lucide-react";

const newsCategories = ["ALL", "ACADEMICS", "SPORTS", "SPIRITUAL", "COMMUNITY"];

const bentoStories = [
  {
    category: "ACADEMICS",
    title: "Basaer Leads National Innovation in Digital Humanities",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkR2o5a1Z3i1VWHmdep01blU8niaXy2buEjOHTyqEovHNSRvJ0vssWrHWRJJ9SkIh-kTE4FFQUSLI20TU4Q-H7afcir2o6m1m3u4VSSFBv59cyJ4he_qoOyJV6MTMVDFOH4FTVUYPpqVzStzOR9ImVFqzmgbEJ_ab5ih5UFmqHg1Jv4Gzf8M5kDvU4K418rc9SIUKSojhWGkdlyo7huDzWr3VhYxjGqZzuNwEGilE6SjiezZ4xTNahsqlU1fT24wln0kHaLD0mL7g",
  },
  {
    category: "SPIRITUAL",
    title: "Annual Tahfeez Ceremony Dates Announced",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBN6oZXB0Hme6TfhGWljvKBanN1JaFegkeYtjypRZ5fgMP3_6TrBf7VXj1rX1zeFmYh402NQQzjwXwOgewTSCowXiDqfJ8299gs1yTsj5RTdV3dIDLaFv6tqBf_MWUBsUu-9pgsQ9tbZf15oCLe7G7GrbqDtxzll5vDVJCxyDbwnivbG8RBmTNxLI445hCCg4pARE0CiGYWwmGFw7tqIx3QlfVCyCT-rsc17qh4dDAXNxcbt6WQB4Y7pqGCKRIzkqjRbs49gcN6vqA",
  },
  {
    category: "SPORTS",
    title: "Basaer Falcons Clinch Inter-School Championship",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbeERKeCzE6WINBl2hIi09K4wByx1Ng3XSWqLLqGSEhbHdmwafuIjYmaZ8psnOdBNlJUpelmxgu5CxwH3BPz317RLDa3i97RyrWqJRiQ6LByG79vymwgkdUvppP4af-jIEpEwzsW5oYXrhZ8E2Fqy0RpndvP8JWBEKkPoFCnHPCjAXZxtly8Ma3SjK-fYGJoj5CKAyFf_z7K8ti8Bq43zCM7aMl0DHCOfrB46ohKeyNa2tJ5L332PLn8yQ6TrBOBXDyVW74Y-LFVg",
  },
];

const feedArticles = [
  {
    id: 1,
    date: "OCT 24, 2024",
    category: "ACADEMICS",
    title: "Integrating AI in Curriculum: A New Chapter",
    desc: "Our educators are pioneering new ways to blend ethical AI foundations into the core curriculum, preparing students for tomorrow's challenges.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEeqBxWXJ7hKyOpv_yOpgRJdcNNj7IwW9DBC71mope30pE4W40G2SNufCfSF0aSqextFK3hs2F5r2vUjxvD9yVTWgHqWb0D3opyvYfOiMLCF2oTIQ6NFv9u6UmU6pPSOc7TyxMQZPsRHOf9LBoe6Fs72C3uL1UopatVvnhdaHnoZFzB3moH7VrZ3kYLkNT1cpBQg0sJ9ClqFJbEoO00d7xpORLjBBQB8XmkcDgqDHIv5zhDgBE4PoFY5z9dE34nsKWt3Bzh5ZUA5Y",
  },
  {
    id: 2,
    date: "OCT 18, 2024",
    category: "COMMUNITY",
    title: "Giving Back: The Annual Community Drive Results",
    desc: "Thanks to our dedicated families, this year's drive has reached record-breaking support for local initiatives.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaaNOtqLtzioCC1NiGQYhCA7cM-sIdSflHITuo6LVF01-TxPvv7u9veg2H6KUTcbF1GA87Q9nIRGhPKs4uzyT69QD0dpM3i57Tabg_pGJKCnj-B4ANWKCLQD7tz7Z5Lp4q5rDAhP8utId1-Uv4Ehgpq2quDuleCJOpKamZYh53Ed7rVu6Nts0YUhMS2T2eUf_cFDlPnSi7RSXyxbkgOVCNA9AG-cGWCrnAJdBxG7oZzQ2o-k1KR1loqih6f0XDdXRGjZT69wAMMSQ",
  },
  {
    id: 3,
    date: "OCT 12, 2024",
    category: "SPIRITUAL",
    title: "Spiritual Reflections: Monthly Night Vigil Series",
    desc: "Join us as we explore deep spiritual insights through our popular monthly vigil and reflection sessions led by scholars.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAK6D3TvbRVOHM1z2VOS71JcMeWB9oCSiWKmsnI2K7vKFixDuuMtBgDWoZbFgsBhXBC7zUn4JGHoph-cJEdfrwzqTwn-aAdFwJDmutsLmgFGctZgYlO9vUGyFLL32Y5OvBaK7CVGat0Ky0Zq2G2codpE9rq2Ofd82_LNiBmI6K6TEiHgwT2hMhTyOmhuUiyiKlGARk6X-8Dz44Owlrxrw6zoZTBVhMm3DFKgWCJEbS0_6lbzPKgi3i339guU1ObCReSfUlneb4xMb4",
  },
];

const upcomingEvents = [
  {
    day: "12",
    month: "NOV",
    title: "Digital Arts & Ethics Symposium",
    time: "09:00 AM - 02:00 PM",
    location: "Grand Auditorium",
    primaryAction: true,
  },
  {
    day: "18",
    month: "NOV",
    title: "Parent-Teacher Illuminating Souls Summit",
    time: "04:30 PM - 07:00 PM",
    location: "Virtual Portal",
    primaryAction: false,
  },
  {
    day: "02",
    month: "DEC",
    title: "Global Alumni Networking Night",
    time: "06:00 PM - 09:00 PM",
    location: "Skyline Lounge",
    primaryAction: false,
  },
];

const socialHubPhotos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBe1LCAgZxLH1r28A9Cfd3anwQd3lPSWE9qfkwKwKHtDyNbyyoTnZ2BRH9lvmColDW0oGu62Zw3q_zwBNsNgOktk_TigYMrywiJrLbu2bYJGax9lrYM2bEAFUaPlwizvq-Xjxo7yNj8CbvxeSkNHF5D0Cg7EsJOKeNkgbY6aoHSeXV8maDMPDdvqvlTTSnLQ6E2UwVidgDH4lGjlG4LxzLXpI5sQixvdDQ1nKoT5Ai6KF8dLkLFmgSMn4btD8e-I7ASU8traZ3_vgY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpnTW_WI9FFbzmXG_CaOWcU4bnjNzx5SkpT3M0Daf2typt5pt5g-n4BAur-9xAIBPsughZ39r80JmwWPwt_zOoDmlEH38TnCDzWAM36628zUHxdoRM1K0LJkMI9yhJw4o23aBnRtgU_cMVQ_BIBkpOcupqoQfWI5rKYVp6U4OX_dDjfi651aZtDxsHV--9gEEHHMh_NH2DF8wkIYpy7_1n5Nh38Yjdj0h-oeLOujUEmotdoLxKB9w_2WTsDtABW0gPBF0osSYFbRs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBrY8SNlA7thdJie2LWLDKWkh3thqSo3g-bY_7F3ikuAfgl2zcPLz_qD1anLqflwWAueabHxswYfrQtG49SuHWXqjrLIethnLH2M6bZVUtFOCPgPvnx8bY9lXJoVX5AyNyE9143WERCCo4yNMDiWIuD2PBWmA3W48QobwXRvgg8qIWeXnPTJLy_prMaXb1q_W_0SK_Z-CQasR_0XB2hnAI4T_bWkWtsnWhMC_8AO6SKWYhTf2PuGLme3Y2UTIGMpeE1gY-9P2-1uWQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBfLMUVMyEIvKu4PzDV_2Ya3DWEzZxoFD6VXlZTLDWVROUC3ti96iX0Tz9TQX_I9MMkfyFtBpA9AzQAK-ohilj7Eme4Pde2AbTWTiaV9DYKRnomzKC1HPUIAT1-bIOxspRA54mXbDxoQNJmm8_CGhM1for-x3RJDwc9FqKYtSty7uK5Mfm5867THSJ8CrTkMiUln8ZSCxH_PSaLy2TxYVXo--k1bOC-QBEZ6rN5h6-H1_ca-E9q5jMGnWYG-inGbeTVDet5dPNnFMc",
];

export default function NewsEventsPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredFeed = feedArticles.filter(
    (art) => activeFilter === "ALL" || art.category === activeFilter
  );

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 mb-16">
          <div className="space-y-4">
            <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase block">
              WEEKLY DIARY
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary font-heading">
              Stay Connected: <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">The Basaer Pulse.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Discover the latest achievements, spiritual milestones, and community highlights from the heart of Basaer Model School.
            </p>
          </div>

          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[600px]">
            {/* Main Headline Story (Lg) */}
            <div className="lg:col-span-8 relative rounded-[32px] overflow-hidden bg-surface-container border border-border group flex flex-col justify-end min-h-[400px]">
              <Image
                alt="Digital Humanities Lab collaboration study"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                src={bentoStories[0].image}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div className="relative z-10 p-8 space-y-4">
                <span className="bg-primary text-text-primary px-4 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase inline-block">
                  {bentoStories[0].category}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-text-primary font-heading leading-tight">
                  {bentoStories[0].title}
                </h2>
                <button className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider group hover:text-text-primary transition-colors">
                  Read Full Story <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Side Secondary Columns */}
            <div className="lg:col-span-4 flex flex-col gap-8 h-full justify-between">
              {/* Secondary Story 1 */}
              <div className="relative rounded-[24px] overflow-hidden bg-surface-container border border-border group flex-1 min-h-[180px] flex flex-col justify-end">
                <Image
                  alt="Annual Tahfeez Ceremony spiritual geometric thobe"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                  src={bentoStories[1].image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                <div className="relative z-10 p-6 space-y-2">
                  <span className="text-primary font-bold text-xs tracking-wider uppercase block">
                    {bentoStories[1].category}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary font-heading line-clamp-2">
                    {bentoStories[1].title}
                  </h3>
                </div>
              </div>

              {/* Secondary Story 2 */}
              <div className="relative rounded-[24px] overflow-hidden bg-surface-container border border-border group flex-1 min-h-[180px] flex flex-col justify-end">
                <Image
                  alt="Falcons Athletic sports champions"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                  src={bentoStories[2].image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                <div className="relative z-10 p-6 space-y-2">
                  <span className="text-primary font-bold text-xs tracking-wider uppercase block">
                    {bentoStories[2].category}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary font-heading line-clamp-2">
                    {bentoStories[2].title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Feed */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary font-heading">
                Latest News
              </h2>
              <p className="text-lg text-text-secondary">
                Stay updated with our diverse community activities.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {newsCategories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-primary text-text-primary shadow-[0_0_15px_rgba(0,160,225,0.4)]"
                      : "bg-surface-container text-text-secondary hover:text-text-primary hover:bg-white/10 border border-border/50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredFeed.map((art) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  key={art.id}
                  className="bg-surface-container backdrop-blur-md rounded-3xl overflow-hidden border border-border group hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,160,225,0.15)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-48 relative overflow-hidden">
                      <Image
                        alt={art.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        src={art.image}
                      />
                    </div>
                    <div className="px-6 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
                        <span>{art.date}</span>
                        <span className="text-primary">{art.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-text-primary font-heading leading-tight group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                        {art.desc}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <button className="text-primary flex items-center gap-1.5 font-bold text-sm tracking-wider uppercase group hover:text-text-primary transition-colors">
                      Read More <ExternalLink size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-24 bg-surface-container-low mb-16 border-t border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight font-heading">
                Upcoming Events
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Mark your calendars and join our vibrant events. From academic seminars to spiritual gatherings, there's always something happening at Basaer.
              </p>
              <div className="bg-surface-container p-6 rounded-2xl border border-border flex items-start gap-4">
                <Calendar className="text-primary shrink-0 mt-1" size={24} />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-primary tracking-wider uppercase">
                    OCTOBER 2024
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">
                    Registration for Fall Semester competitions is now open.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {upcomingEvents.map((evt) => (
                <div 
                  key={evt.title} 
                  className="bg-surface-container backdrop-blur-md p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 hover:border-primary/30 border border-border transition-all duration-300"
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className="bg-primary/10 text-primary p-4 rounded-xl flex flex-col items-center justify-center shrink-0 min-w-[80px]">
                      <span className="text-2xl font-bold font-heading leading-none">{evt.day}</span>
                      <span className="text-xs font-bold uppercase tracking-widest mt-1">{evt.month}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg md:text-xl font-bold text-text-primary font-heading leading-snug">
                        {evt.title}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {evt.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {evt.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shrink-0 w-full md:w-auto transition-transform hover:scale-105 ${
                    evt.primaryAction 
                      ? "bg-primary text-text-primary shadow-[0_0_15px_rgba(0,160,225,0.3)]" 
                      : "bg-surface-container border border-border text-text-primary hover:bg-white/10"
                  }`}>
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media Integration */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 mb-16">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary font-heading">
              Basaer Social Hub
            </h2>
            <p className="text-lg text-text-secondary">
              Follow our journey across digital platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {socialHubPhotos.map((photo, idx) => (
              <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden bg-surface-container border border-border group">
                <Image
                  alt="Basaer social feed update capture"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  src={photo}
                />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <Share2 className="text-text-primary hover:scale-110 transition-transform cursor-pointer" size={24} />
                  <Heart className="text-text-primary hover:scale-110 transition-transform cursor-pointer" size={24} />
                  <MessageSquare className="text-text-primary hover:scale-110 transition-transform cursor-pointer" size={24} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="text-primary font-bold text-xs tracking-widest uppercase flex items-center gap-2 group hover:text-text-primary transition-all mx-auto">
              View More Updates <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

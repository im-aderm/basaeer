import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";

const AboutSection = dynamic(() => import("@/components/landing/AboutSection").then(m => m.AboutSection));
const QuranMemorizationSection = dynamic(() => import("@/components/landing/QuranMemorizationSection").then(m => m.QuranMemorizationSection));
const ProgramSection = dynamic(() => import("@/components/landing/ProgramSection").then(m => m.ProgramSection));
const StatsSection = dynamic(() => import("@/components/landing/StatsSection").then(m => m.StatsSection));
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection").then(m => m.TestimonialsSection));
const MobileAppCTA = dynamic(() => import("@/components/landing/MobileAppCTA").then(m => m.MobileAppCTA));
const NewsSection = dynamic(() => import("@/components/landing/NewsSection").then(m => m.NewsSection));
const AdmissionCTASection = dynamic(() => import("@/components/landing/AdmissionCTASection").then(m => m.AdmissionCTASection));
const CampusesSection = dynamic(() => import("@/components/landing/CampusesSection").then(m => m.CampusesSection));

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden animate-fade-in">
      <GradientBackground />

      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <AboutSection />
        <QuranMemorizationSection />
        <ProgramSection />
        <StatsSection />
        <CampusesSection />
        <TestimonialsSection />
        <MobileAppCTA />
        <NewsSection />
        <AdmissionCTASection />
      </main>
      <Footer />
    </div>
  );
}

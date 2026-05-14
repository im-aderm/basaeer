import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";

const AboutSection = dynamic(() => import("@/components/landing/AboutSection").then(m => m.AboutSection));
const QuranMemorizationSection = dynamic(() => import("@/components/landing/QuranMemorizationSection").then(m => m.QuranMemorizationSection));
const ProgramSection = dynamic(() => import("@/components/landing/ProgramSection").then(m => m.ProgramSection));
const StatsSection = dynamic(() => import("@/components/landing/StatsSection").then(m => m.StatsSection));
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection").then(m => m.TestimonialsSection));
const MobileAppCTA = dynamic(() => import("@/components/landing/MobileAppCTA").then(m => m.MobileAppCTA));
const NewsSection = dynamic(() => import("@/components/landing/NewsSection").then(m => m.NewsSection));
const AdmissionCTASection = dynamic(() => import("@/components/landing/AdmissionCTASection").then(m => m.AdmissionCTASection));

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden animate-fade-in">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <AboutSection />
        <QuranMemorizationSection />
        <ProgramSection />
        <StatsSection />
        <TestimonialsSection />
        <MobileAppCTA />
        <NewsSection />
        <AdmissionCTASection />
      </main>
      <Footer />
    </div>
  );
}
export const metadata = {
  title: "Basaer Model School | Shaping Future Leaders with Science & Spirit",
  description: "At Basaer, we bridge the gap between world-class academic excellence and profound spiritual growth, nurturing the minds and souls of the next generation.",
};

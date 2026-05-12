import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { AboutSection } from "@/components/landing/AboutSection";
import { QuranMemorizationSection } from "@/components/landing/QuranMemorizationSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { MobileAppCTA } from "@/components/landing/MobileAppCTA";
import { NewsSection } from "@/components/landing/NewsSection";
import { AdmissionCTASection } from "@/components/landing/AdmissionCTASection";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";

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

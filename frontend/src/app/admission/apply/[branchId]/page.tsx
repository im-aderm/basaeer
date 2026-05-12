"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";

const MultiStepAdmissionForm = dynamic(
  () => import("@/components/admission/MultiStepAdmissionForm").then(m => m.MultiStepAdmissionForm),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function PublicAdmissionPage() {
  const params = useParams();
  const branchId = params.branchId as string;
  const { updateFormData } = useAdmissionStore();

  useEffect(() => {
    if (branchId) {
      updateFormData({ branchId });
    }
  }, [branchId, updateFormData]);

  return (
    <div className="relative min-h-screen bg-background text-text-primary selection:bg-primary/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-border text-primary text-xs font-semibold uppercase tracking-wider">
              Admission Portal
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-gradient-primary">
              Begin Your Journey
            </h1>
            <p className="text-base text-text-secondary font-medium max-w-xl mx-auto">
              Embark on an outstanding academic and spiritual journey with Basaer Quranic and Science College.
            </p>
          </div>

          <MultiStepAdmissionForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

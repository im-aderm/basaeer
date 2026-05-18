"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Shield, BookOpen, GraduationCap } from "lucide-react";

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
  const { updateFormData, setStep, resetForm } = useAdmissionStore();

  useEffect(() => {
    resetForm();
    if (branchId) {
      updateFormData({ desiredBranchId: branchId, branchId });
    }
  }, [branchId]);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero header */}
      <div className="bg-white border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap size={18} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">Admission Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Begin Your Journey
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Apply for admission to Basaer Quranic and Science College. Complete the form below to start your application.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full text-xs font-medium text-primary">
              <Shield size={14} />
              Islamic Values
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full text-xs font-medium text-primary">
              <BookOpen size={14} />
              Triple Curriculum
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full text-xs font-medium text-primary">
              <GraduationCap size={14} />
              Academic Excellence
            </div>
          </div>
        </div>
      </div>

      {/* Form area */}
      <main className="px-6 py-8">
        <MultiStepAdmissionForm />
      </main>

      <Footer />
    </div>
  );
}

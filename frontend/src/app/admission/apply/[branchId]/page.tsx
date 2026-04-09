"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import dynamic from "next/dynamic";

const MultiStepAdmissionForm = dynamic(
    () => import("@/components/admission/MultiStepAdmissionForm").then(m => m.MultiStepAdmissionForm),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
        )
    }
);
import { useParams } from "next/navigation";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-muted/30 py-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight italic uppercase drop-shadow-sm">
            Admission Portal
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium italic opacity-70">
            Begin your academic journey with Basaeer Quranic and Science College.
          </p>
        </div>

        <MultiStepAdmissionForm />
      </div>
    </div>
  );
}

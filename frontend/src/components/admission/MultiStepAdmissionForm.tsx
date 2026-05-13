"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { AdmissionStepper } from "./AdmissionStepper";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { IntroStep } from "./steps/IntroStep";
import { CandidateInfo } from "./steps/CandidateInfo";
import { ParentInfo } from "./steps/ParentInfo";
import { PreviousSchool } from "./steps/PreviousSchool";
import { MedicalInfo } from "./steps/MedicalInfo";
import { DocumentUpload } from "./steps/DocumentUpload";
import { ConductStep } from "./steps/ConductStep";
import { PaymentStep } from "./steps/PaymentStep";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { CheckCircle2 } from "lucide-react";

export function MultiStepAdmissionForm() {
  const { currentStep, nextStep, prevStep, formData, resetForm, stepErrors } = useAdmissionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinalSubmit = async () => {
    if (!formData.paymentProofUrl) {
      toast.error("Please upload your payment proof first");
      return;
    }
    if (!formData.schoolRulesAgreement) {
      toast.error("You must accept the school rules to proceed");
      return;
    }

    setIsSubmitting(true);
    try {
      await OnlineAdmissionService.create(formData);
      setIsSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : "Failed to submit application. Please try again.");
      
      // Show specific validation errors if available
      if (Array.isArray(error.response?.data?.message)) {
        toast.error(`Validation failed: ${error.response.data.message.slice(0, 3).join(", ")}`);
      } else if (typeof error.response?.data?.message === "string") {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to submit application. Please check all fields and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-none shadow-2xl bg-card rounded-[3rem] overflow-hidden p-16 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-500/10 text-green-500 shadow-2xl">
          <CheckCircle2 size={64} />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black tracking-tight italic uppercase">Application Received!</h2>
          <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto italic">
            Thank you for applying to Basaer Quranic College. Our registrar will review your documents and payment shortly. You will receive an email update soon.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="rounded-2xl px-8 h-12 font-bold italic"
        >
          Submit Another Application
        </Button>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <IntroStep />;
      case 2: return <CandidateInfo />;
      case 3: return <ParentInfo />;
      case 4: return <PreviousSchool />;
      case 5: return <MedicalInfo />;
      case 6: return <DocumentUpload />;
      case 7: return <ConductStep />;
      case 8: return <PaymentStep />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <AdmissionStepper currentStep={currentStep} />

      <Card className="border-none shadow-2xl bg-card rounded-[3rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="p-8 bg-muted/30 flex justify-between items-center border-t border-border">
          {stepErrors[currentStep]?.length > 0 && (
            <div className="text-sm text-destructive font-medium mr-auto pr-4">
              {stepErrors[currentStep].join('. ')}
            </div>
          )}

          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="rounded-2xl px-6 h-12 font-bold italic"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {currentStep < 8 ? (
            <Button
              onClick={nextStep}
              className="rounded-2xl px-8 h-12 font-black italic shadow-lg shadow-primary/30"
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="rounded-2xl px-12 h-14 font-black italic shadow-xl shadow-primary/40 text-lg bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

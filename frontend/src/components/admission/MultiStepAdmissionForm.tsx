"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { AdmissionStepper } from "./AdmissionStepper";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNotification } from '@/context/NotificationContext';

import { IntroStep } from "./steps/IntroStep";
import { CandidateInfo } from "./steps/CandidateInfo";
import { ParentInfo } from "./steps/ParentInfo";
import { PreviousSchool } from "./steps/PreviousSchool";
import { MedicalInfo } from "./steps/MedicalInfo";
import { DocumentUpload } from "./steps/DocumentUpload";
import { ConductStep } from "./steps/ConductStep";
import { PaymentStep } from "./steps/PaymentStep";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";

const stepTitles: Record<number, string> = {
  1: "Getting Started",
  2: "Student Information",
  3: "Parent / Guardian",
  4: "Previous School",
  5: "Medical & Additional",
  6: "Document Uploads",
  7: "Code of Conduct",
  8: "Payment & Submit",
};

export function MultiStepAdmissionForm() {
  const { currentStep, setStep, nextStep, prevStep, formData, resetForm, stepErrors, validateCurrentStep } = useAdmissionStore();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setStep(step);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.schoolRulesAgreement) {
      showError("You must accept the school rules to proceed");
      return;
    }

    setIsSubmitting(true);
    try {
      await OnlineAdmissionService.create(formData);
      setIsSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showSuccess("Application submitted successfully!");
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Submission error:", error);

      const friendlyMessages: Record<string, string> = {
        'firstName must be a string': 'First name is required',
        'lastName must be a string': 'Last name is required',
        'gender must be a string': 'Gender is required',
        'dateOfBirth must be a DateString': 'Date of birth is required',
        'guardianName must be a string': 'Guardian name is required',
        'guardianPhone must be a string': 'Guardian phone is required',
        'desiredClassId must be a UUID': 'Please select a class',
        'branchId must be a UUID': 'Branch selection is required',
        'expected string, received undefined': 'Please fill in all required fields',
      };

      const raw = error.response?.data?.message;
      let displayMessage = "Failed to submit application. Please check all fields and try again.";

      if (Array.isArray(raw)) {
        const translated = raw.map((m: string) => friendlyMessages[m] || m).slice(0, 3);
        displayMessage = `Please fix: ${translated.join("; ")}`;
      } else if (typeof raw === "string") {
        displayMessage = friendlyMessages[raw] || raw;
      }

      showError(displayMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border border-border/50 shadow-xl bg-white rounded-2xl overflow-hidden p-12 text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Application Received!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for applying to Basaer Quranic and Science College. Our registrar will review your documents and payment shortly.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="rounded-lg px-6"
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

  const totalSteps = 8;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Stepper */}
      <div className="bg-white rounded-xl border border-border/50 shadow-sm px-4 py-4">
        <AdmissionStepper currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      {/* Step title */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          Step {currentStep} of {totalSteps}
        </span>
        <h2 className="text-lg font-semibold text-foreground">
          {stepTitles[currentStep]}
        </h2>
      </div>

      {/* Form card */}
      <Card className="border border-border/50 shadow-sm bg-white rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-between gap-4">
          {stepErrors[currentStep]?.length > 0 && (
            <div className="text-sm text-destructive font-medium">
              {stepErrors[currentStep].join('. ')}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="rounded-lg px-4"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="rounded-lg px-6 bg-primary hover:bg-primary/90"
              >
                Next <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="rounded-lg px-8 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

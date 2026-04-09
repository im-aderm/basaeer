"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
}

const steps: Step[] = [
  { id: 1, title: "Intro" },
  { id: 2, title: "Candidate" },
  { id: 3, title: "Parent" },
  { id: 4, title: "School" },
  { id: 5, title: "Medical" },
  { id: 6, title: "Uploads" },
  { id: 7, title: "Conduct" },
  { id: 8, title: "Payment" },
];

interface AdmissionStepperProps {
  currentStep: number;
}

export function AdmissionStepper({ currentStep }: AdmissionStepperProps) {
  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between min-w-[600px] px-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep === step.id
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110"
                    : currentStep > step.id
                    ? "bg-primary border-primary text-white"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest absolute -bottom-5 whitespace-nowrap",
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            
            {idx !== steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-muted relative">
                <div
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{
                    width: currentStep > step.id ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="h-6" /> {/* Spacer for labels */}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

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
  onStepClick: (step: number) => void;
}

export function AdmissionStepper({ currentStep, onStepClick }: AdmissionStepperProps) {
  return (
    <div className="w-full py-6">
      {/* Mobile: compact horizontal scroll */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => step.id < currentStep && onStepClick(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold",
                currentStep === step.id
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/30"
                  : currentStep > step.id
                  ? "bg-primary/10 border-primary/40 text-primary cursor-pointer hover:bg-primary/20"
                  : "bg-muted border-border text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {currentStep > step.id ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                step.id
              )}
            </button>
            {idx !== steps.length - 1 && (
              <ChevronRight
                size={14}
                className={cn(
                  "mx-1.5 transition-colors",
                  currentStep > step.id ? "text-primary/40" : "text-muted-foreground/20"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Desktop: full stepper with labels */}
      <div className="hidden md:flex items-center justify-between px-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => step.id < currentStep && onStepClick(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "flex flex-col items-center relative gap-2 transition-all duration-200",
                step.id < currentStep
                  ? "cursor-pointer hover:scale-105 active:scale-95"
                  : step.id === currentStep
                  ? "cursor-default"
                  : "cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep === step.id
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110 ring-4 ring-primary/10"
                    : currentStep > step.id
                    ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20"
                    : "bg-muted border-border text-muted-foreground/40"
                )}
              >
                {currentStep > step.id ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider absolute -bottom-5 whitespace-nowrap transition-colors",
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground/40"
                )}
              >
                {step.title}
              </span>
            </button>

            {idx !== steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-border relative">
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
      <div className="h-6" />
    </div>
  );
}

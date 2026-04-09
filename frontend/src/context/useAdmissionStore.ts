import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdmissionFormData } from "@/types/admission-schema";

interface AdmissionState {
  formData: Partial<AdmissionFormData>;
  currentStep: number;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<AdmissionFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
}

export const useAdmissionStore = create<AdmissionState>()(
  persist(
    (set) => ({
      formData: {
        branchId: "",
        gender: "MALE",
        guardianType: "FATHER",
        admissionTerm: "FIRST",
        admissionType: "NEW",
        hasAppliedBefore: false,
        hasMedicalCondition: false,
        hasLearningDifficulty: false,
        hasSpecialNeeds: false,
        seekingFinancialAid: false,
        hasSiblingsInSchool: false,
        schoolRulesAgreement: false,
        previousSchools: [],
        siblings: [],
      },
      currentStep: 1,
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
      resetForm: () => set({ currentStep: 1, formData: {} }),
    }),
    {
      name: "admission-form-storage",
    }
  )
);

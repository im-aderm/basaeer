import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";

type FieldKey = keyof AdmissionFormData;

const stepFields: Record<number, FieldKey[]> = {
  1: ["desiredBranchId", "admissionType"],
  2: ["firstName", "surname", "address", "gender", "dateOfBirth"],
  3: ["guardianName", "guardianContact1"],
  4: [],
  5: [],
  6: [],
  7: ["desiredClassId"],
  8: [],
  9: ["schoolRulesAgreement"],
};

interface AdmissionState {
  formData: Partial<AdmissionFormData>;
  currentStep: number;
  stepErrors: Record<number, string[]>;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<AdmissionFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  validateCurrentStep: () => boolean;
}

export const useAdmissionStore = create<AdmissionState>()(
  persist(
    (set, get) => ({
      formData: {
        branchId: "",
        desiredBranchId: "",
        admissionType: "NEW",
        gender: "MALE",
        guardianType: "FATHER",
        admissionTerm: "FIRST",
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
      stepErrors: {},
      setStep: (step) => set({ currentStep: step, stepErrors: {} }),
      updateFormData: (data) =>
        set((state) => {
          const hasChanged = Object.entries(data).some(
            ([key, value]) => state.formData[key as FieldKey] !== value
          );
          if (!hasChanged) return state;
          return { formData: { ...state.formData, ...data } };
        }),
      nextStep: () => {
        const { currentStep } = get();
        if (get().validateCurrentStep()) {
          set({ currentStep: currentStep + 1, stepErrors: {} });
        }
      },
      prevStep: () => set((state) => ({ currentStep: state.currentStep - 1, stepErrors: {} })),
      resetForm: () => set({ currentStep: 1, formData: {}, stepErrors: {} }),
      validateCurrentStep: () => {
        const { currentStep, formData } = get();
        const fields = stepFields[currentStep];
        if (!fields || fields.length === 0) return true;

        const result = AdmissionSchema.safeParse(formData);
        if (result.success) return true;

        const stepFieldSet = new Set<string>(fields);
        const errors = result.error.issues
          .filter((issue) => stepFieldSet.has(issue.path[0] as string))
          .map((issue) => issue.message);

        set({ stepErrors: { ...get().stepErrors, [currentStep]: errors } });
        return errors.length === 0;
      },
    }),
    {
      name: "admission-form-storage",
    }
  )
);

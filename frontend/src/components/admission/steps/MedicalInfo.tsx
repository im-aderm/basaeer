"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { HeartPulse, Info, Users } from "lucide-react";

export function MedicalInfo() {
  const { formData, updateFormData } = useAdmissionStore();
  
  const { register, setValue, watch, formState: { errors } } = useForm<Partial<AdmissionFormData>>({
    resolver: zodResolver(AdmissionSchema.pick({
      hasAppliedBefore: true,
      howHeard: true,
      hasMedicalCondition: true,
      medicalConditionInfo: true,
      hasLearningDifficulty: true,
      learningDifficultyInfo: true,
      hasSpecialNeeds: true,
      specialNeedsInfo: true,
      seekingFinancialAid: true,
      hasSiblingsInSchool: true,
    })),
    defaultValues: formData,
  });

  const watchedFields = watch();
  const debouncedFields = useDebounce(watchedFields, 500);

  useEffect(() => {
    updateFormData(debouncedFields);
  }, [debouncedFields, updateFormData]);

  const hasMedical = watchedFields.hasMedicalCondition;
  const hasDifficulty = watchedFields.hasLearningDifficulty;
  const hasSpecial = watchedFields.hasSpecialNeeds;
  const hasSiblings = watchedFields.hasSiblingsInSchool;

  return (
    <CardContent className="p-8 space-y-10">
      {/* Medical Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
          <HeartPulse size={20} /> Medical Information
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
            <Label className="font-bold">Medical Condition?</Label>
            <Switch checked={hasMedical} onCheckedChange={(v) => setValue("hasMedicalCondition", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
            <Label className="font-bold">Learning Difficulty?</Label>
            <Switch checked={hasDifficulty} onCheckedChange={(v) => setValue("hasLearningDifficulty", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
            <Label className="font-bold">Special Needs?</Label>
            <Switch checked={hasSpecial} onCheckedChange={(v) => setValue("hasSpecialNeeds", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
            <Label className="font-bold">Seeking Financial Aid?</Label>
            <Switch checked={watch("seekingFinancialAid")} onCheckedChange={(v) => setValue("seekingFinancialAid", v)} />
          </div>
        </div>

        {(hasMedical || hasDifficulty || hasSpecial) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            {hasMedical && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Medical Details</Label>
                <Textarea {...register("medicalConditionInfo")} className="rounded-2xl border-2 font-medium" placeholder="Describe any medical conditions..." />
              </div>
            )}
            {hasDifficulty && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Learning Difficulty Details</Label>
                <Textarea {...register("learningDifficultyInfo")} className="rounded-2xl border-2 font-medium" placeholder="Describe any learning difficulties..." />
              </div>
            )}
            {hasSpecial && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Special Needs Details</Label>
                <Textarea {...register("specialNeedsInfo")} className="rounded-2xl border-2 font-medium" placeholder="Describe any special needs..." />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sibling Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
          <Users size={20} /> Sibling Information
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
          <Label className="font-bold">Siblings currently in Basaeer?</Label>
          <Switch checked={hasSiblings} onCheckedChange={(v) => setValue("hasSiblingsInSchool", v)} />
        </div>
      </div>

      {/* Additional */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
          <Info size={20} /> Additional Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
            <Label className="font-bold">Have you applied before?</Label>
            <Switch checked={watch("hasAppliedBefore")} onCheckedChange={(v) => setValue("hasAppliedBefore", v)} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">How did you hear about us?</Label>
            <Input {...register("howHeard")} className="h-12 rounded-2xl border-2 font-bold" placeholder="e.g. Facebook, Friend..." />
          </div>
        </div>
      </div>
    </CardContent>
  );
}

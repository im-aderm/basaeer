"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Trash2 } from "lucide-react";

export function MedicalInfo() {
  const { formData, updateFormData } = useAdmissionStore();

  const { register, setValue, watch, control } = useForm<Partial<AdmissionFormData>>({
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
      siblings: true,
    })),
    defaultValues: formData,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "siblings" });

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
    <CardContent className="p-6 md:p-8 space-y-8">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Medical & Additional Info</h3>
        <p className="text-sm text-muted-foreground">Help us understand any special needs or circumstances.</p>
      </div>

      {/* Medical switches */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-foreground">Health & Learning</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
            <Label className="text-sm font-medium">Medical condition?</Label>
            <Switch checked={hasMedical} onCheckedChange={(v) => setValue("hasMedicalCondition", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
            <Label className="text-sm font-medium">Learning difficulty?</Label>
            <Switch checked={hasDifficulty} onCheckedChange={(v) => setValue("hasLearningDifficulty", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
            <Label className="text-sm font-medium">Special needs?</Label>
            <Switch checked={hasSpecial} onCheckedChange={(v) => setValue("hasSpecialNeeds", v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
            <Label className="text-sm font-medium">Seeking financial aid?</Label>
            <Switch checked={watch("seekingFinancialAid")} onCheckedChange={(v) => setValue("seekingFinancialAid", v)} />
          </div>
        </div>

        {(hasMedical || hasDifficulty || hasSpecial) && (
          <div className="space-y-3">
            {hasMedical && (
              <div className="space-y-1">
                <Label>Medical details</Label>
                <Textarea {...register("medicalConditionInfo")} className="rounded-lg" placeholder="Describe any medical conditions..." />
              </div>
            )}
            {hasDifficulty && (
              <div className="space-y-1">
                <Label>Learning difficulty details</Label>
                <Textarea {...register("learningDifficultyInfo")} className="rounded-lg" placeholder="Describe any learning difficulties..." />
              </div>
            )}
            {hasSpecial && (
              <div className="space-y-1">
                <Label>Special needs details</Label>
                <Textarea {...register("specialNeedsInfo")} className="rounded-lg" placeholder="Describe any special needs..." />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sibling Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
          <Label className="text-sm font-medium">Siblings currently enrolled?</Label>
          <Switch checked={hasSiblings} onCheckedChange={(v) => setValue("hasSiblingsInSchool", v)} />
        </div>

        {hasSiblings && (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start p-4 bg-muted/30 border border-border/50 rounded-xl">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Sibling Name</Label>
                    <Input {...register(`siblings.${index}.name`)} className="h-10 rounded-lg" placeholder="Name" />
                  </div>
                  <div className="space-y-1">
                    <Label>Class/Level</Label>
                    <div className="flex gap-2">
                      <Input {...register(`siblings.${index}.level`)} className="h-10 rounded-lg" placeholder="e.g. Grade 3" />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="h-10 w-10 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", level: "" })}
              className="rounded-lg"
            >
              <Plus size={16} className="mr-1" /> Add Sibling
            </Button>
          </div>
        )}
      </div>

      {/* Additional */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-foreground">Additional</div>
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
          <Label className="text-sm font-medium">Applied before?</Label>
          <Switch checked={watch("hasAppliedBefore")} onCheckedChange={(v) => setValue("hasAppliedBefore", v)} />
        </div>
        <div className="space-y-1">
          <Label>How did you hear about us? <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register("howHeard")} className="h-10 rounded-lg" placeholder="e.g. Facebook, Friend, Website..." />
        </div>
      </div>
    </CardContent>
  );
}

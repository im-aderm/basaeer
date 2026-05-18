"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function ParentInfo() {
  const { formData, updateFormData } = useAdmissionStore();
  
  const { register, setValue, watch, formState: { errors } } = useForm<Partial<AdmissionFormData>>({
    resolver: zodResolver(AdmissionSchema.pick({
      guardianType: true,
      guardianName: true,
      guardianContact1: true,
      guardianEmail: true,
      fatherName: true,
      fatherOccupation: true,
      fatherPhone: true,
      motherName: true,
      motherOccupation: true,
      motherPhone: true,
      guardianRelation: true,
    }).partial()),
    defaultValues: formData,
  });

  const watchedFields = watch();
  const guardianType = watchedFields.guardianType;
  const debouncedFields = useDebounce(watchedFields, 500);

  useEffect(() => {
    updateFormData(debouncedFields);
  }, [debouncedFields, updateFormData]);

  return (
    <CardContent className="p-6 md:p-8 space-y-8">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Parent / Guardian Information</h3>
        <p className="text-sm text-muted-foreground">Provide details of the student's parents or primary guardian.</p>
      </div>

      {/* Guardian type */}
      <div className="p-5 bg-muted/30 rounded-xl space-y-4">
        <Label className="text-sm font-medium text-foreground">I am the child's:</Label>
        <RadioGroup 
          value={guardianType} 
          onValueChange={(v) => setValue("guardianType", v as any)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FATHER" id="father" />
            <Label htmlFor="father" className="font-medium cursor-pointer">Father</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MOTHER" id="mother" />
            <Label htmlFor="mother" className="font-medium cursor-pointer">Mother</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="GUARDIAN" id="guardian" />
            <Label htmlFor="guardian" className="font-medium cursor-pointer">Other Guardian</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Father & Mother info side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-5 bg-muted/30 rounded-xl">
          <div className="text-sm font-semibold text-foreground">Father's Details</div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register("fatherName")} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label>Occupation</Label>
              <Input {...register("fatherOccupation")} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...register("fatherPhone")} className="h-10 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 bg-muted/30 rounded-xl">
          <div className="text-sm font-semibold text-foreground">Mother's Details</div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register("motherName")} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label>Occupation</Label>
              <Input {...register("motherOccupation")} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...register("motherPhone")} className="h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary guardian for communications */}
      <div className="space-y-4 p-5 bg-primary/5 rounded-xl border border-primary/10">
        <div className="text-sm font-semibold text-primary">Primary Contact (for school communications)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input {...register("guardianName")} className="h-10 rounded-lg bg-white" />
            {errors.guardianName && <p className="text-xs text-destructive">{errors.guardianName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input {...register("guardianEmail")} type="email" placeholder="example@email.com" className="h-10 rounded-lg bg-white" />
          </div>
          <div className="space-y-1">
            <Label>Primary Phone</Label>
            <Input {...register("guardianContact1")} className="h-10 rounded-lg bg-white" />
            {errors.guardianContact1 && <p className="text-xs text-destructive">{errors.guardianContact1.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Backup Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input {...register("guardianContact2")} className="h-10 rounded-lg bg-white" />
          </div>
        </div>
      </div>
    </CardContent>
  );
}

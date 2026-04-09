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
import { User, ShieldCheck } from "lucide-react";

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
  const guardianType = watch("guardianType");

  useEffect(() => {
    updateFormData(watchedFields);
  }, [watchedFields, updateFormData]);

  return (
    <CardContent className="p-8 space-y-8">
      <div className="space-y-4 text-center pb-4 border-b">
        <Label className="text-sm font-black uppercase tracking-[0.2em] text-primary">I am the child's:</Label>
        <RadioGroup 
          defaultValue={guardianType} 
          onValueChange={(v) => setValue("guardianType", v as any)}
          className="flex justify-center gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FATHER" id="father" />
            <Label htmlFor="father" className="font-bold italic">Father</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MOTHER" id="mother" />
            <Label htmlFor="mother" className="font-bold italic">Mother</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="GUARDIAN" id="guardian" />
            <Label htmlFor="guardian" className="font-bold italic">Other Guardian</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Father's Info */}
        <div className="space-y-6 p-6 bg-muted/50 rounded-[2.5rem] border border-border">
          <div className="flex items-center gap-2 text-primary font-black italic uppercase text-xs">
            <User size={16} /> Father's Details
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name</Label>
            <Input {...register("fatherName")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Occupation</Label>
            <Input {...register("fatherOccupation")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
            <Input {...register("fatherPhone")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
        </div>

        {/* Mother's Info */}
        <div className="space-y-6 p-6 bg-muted/50 rounded-[2.5rem] border border-border">
          <div className="flex items-center gap-2 text-primary font-black italic uppercase text-xs">
            <User size={16} /> Mother's Details
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name</Label>
            <Input {...register("motherName")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Occupation</Label>
            <Input {...register("motherOccupation")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
            <Input {...register("motherPhone")} className="h-12 rounded-2xl border-2 font-bold" />
          </div>
        </div>
      </div>

      {/* Primary Guardian Detail (Active for notifications) */}
      <div className="space-y-6 p-8 bg-primary/5 rounded-[3rem] border-2 border-primary/20">
         <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
            <ShieldCheck size={20} /> Primary Guardian (For Communications)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
              <Input {...register("guardianName")} className="h-12 rounded-2xl border-2 font-bold bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address *</Label>
              <Input {...register("guardianEmail")} type="email" placeholder="example@email.com" className="h-12 rounded-2xl border-2 font-bold bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Contact *</Label>
              <Input {...register("guardianContact1")} className="h-12 rounded-2xl border-2 font-bold bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Backup Contact</Label>
              <Input {...register("guardianContact2")} className="h-12 rounded-2xl border-2 font-bold bg-white" />
            </div>
          </div>
      </div>
    </CardContent>
  );
}

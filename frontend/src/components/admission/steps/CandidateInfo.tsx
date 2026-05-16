"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function CandidateInfo() {
  const { formData, updateFormData } = useAdmissionStore();
  
  const { register, setValue, watch, formState: { errors } } = useForm<Partial<AdmissionFormData>>({
    resolver: zodResolver(AdmissionSchema.pick({
      firstName: true,
      surname: true,
      address: true,
      gender: true,
      dateOfBirth: true,
    }).partial()),
    defaultValues: formData,
  });

  // Sync with store on change (debounced to avoid re-render loops)
  const watchedFields = watch();
  const debouncedFields = useDebounce(watchedFields, 500);

  useEffect(() => {
    updateFormData(debouncedFields);
  }, [debouncedFields, updateFormData]);

  return (
    <CardContent className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">First Name *</Label>
          <Input 
            {...register("firstName")} 
            placeholder="John" 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
          {errors.firstName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Surname *</Label>
          <Input 
            {...register("surname")} 
            placeholder="Smith" 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
          {errors.surname && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.surname.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Middle Name (optional)</Label>
          <Input 
            {...register("middleName")} 
            placeholder="Doe" 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Gender *</Label>
          <Select 
            value={watch("gender")} 
            onValueChange={(v) => setValue("gender", v as any)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-2 border-primary/60 font-bold">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date of Birth *</Label>
          <Input 
            type="date" 
            {...register("dateOfBirth")} 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Home Address *</Label>
        <Input 
          {...register("address")} 
          placeholder="Enter full residential address" 
          className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">NIN Number</Label>
          <Input 
            {...register("ninNumber")} 
            placeholder="National ID Number" 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
          <Input 
            {...register("phoneNumber")} 
            placeholder="+234..." 
            className="h-12 rounded-2xl border-2 border-primary/60 font-bold"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Genotype</Label>
          <Input {...register("genotype")} placeholder="e.g. AA" className="h-12 rounded-2xl border-2 border-primary/60 font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Blood Group</Label>
          <Input {...register("bloodGroup")} placeholder="e.g. O+" className="h-12 rounded-2xl border-2 border-primary/60 font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nationality</Label>
          <Input {...register("nationality")} placeholder="Nigerian" className="h-12 rounded-2xl border-2 border-primary/60 font-bold" />
        </div>
      </div>
    </CardContent>
  );
}

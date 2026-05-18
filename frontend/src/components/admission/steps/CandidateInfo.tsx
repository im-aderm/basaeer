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

  const watchedFields = watch();
  const debouncedFields = useDebounce(watchedFields, 500);

  useEffect(() => {
    updateFormData(debouncedFields);
  }, [debouncedFields, updateFormData]);

  return (
    <CardContent className="p-6 md:p-8 space-y-6">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Student Information</h3>
        <p className="text-sm text-muted-foreground">Enter the applicant's personal details as they appear on official documents.</p>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            {...register("firstName")} 
            placeholder="John" 
            className="h-10 rounded-lg"
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input 
            id="surname"
            {...register("surname")} 
            placeholder="Smith" 
            className="h-10 rounded-lg"
          />
          {errors.surname && <p className="text-xs text-destructive">{errors.surname.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input 
            id="middleName"
            {...register("middleName")} 
            placeholder="Doe" 
            className="h-10 rounded-lg"
          />
        </div>
      </div>

      {/* Gender & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select 
            value={watch("gender")} 
            onValueChange={(v) => setValue("gender", v as any)}
          >
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input 
            type="date" 
            {...register("dateOfBirth")} 
            className="h-10 rounded-lg"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Home Address</Label>
        <Input 
          {...register("address")} 
          placeholder="Enter full residential address" 
          className="h-10 rounded-lg"
        />
      </div>

      {/* NIN & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>NIN Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input 
            {...register("ninNumber")} 
            placeholder="National ID Number" 
            className="h-10 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input 
            {...register("phoneNumber")} 
            placeholder="+234..." 
            className="h-10 rounded-lg"
          />
        </div>
      </div>
      
      {/* Medical basics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Genotype <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register("genotype")} placeholder="e.g. AA" className="h-10 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label>Blood Group <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register("bloodGroup")} placeholder="e.g. O+" className="h-10 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label>Nationality <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register("nationality")} placeholder="Nigerian" className="h-10 rounded-lg" />
        </div>
      </div>
    </CardContent>
  );
}

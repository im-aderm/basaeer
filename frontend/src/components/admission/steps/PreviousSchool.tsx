"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionSchema, AdmissionFormData } from "@/types/admission-schema";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export function PreviousSchool() {
  const { formData, updateFormData } = useAdmissionStore();
  
  const { register, control, watch, formState: { errors } } = useForm<Partial<AdmissionFormData>>({
    resolver: zodResolver(AdmissionSchema.pick({
      previousSchools: true,
    })),
    defaultValues: {
      previousSchools: formData.previousSchools?.length ? formData.previousSchools : [{ institutionName: "", address: "", fromYear: "", toYear: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "previousSchools" as any,
  });

  const watchedFields = watch();
  const debouncedFields = useDebounce(watchedFields, 500);

  useEffect(() => {
    updateFormData(debouncedFields);
  }, [debouncedFields, updateFormData]);

  return (
    <CardContent className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
          <GraduationCap size={20} /> Academic History
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => append({ institutionName: "", address: "", fromYear: "", toYear: "" })}
          className="rounded-xl border-dashed border-2 font-bold italic h-10"
        >
          <Plus size={16} className="mr-1" /> Add School
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-6 bg-muted/30 rounded-[2.5rem] border border-border relative group">
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institution Name *</Label>
                <Input {...register(`previousSchools.${index}.institutionName` as any)} className="h-12 rounded-2xl border-2 border-primary/60 font-bold bg-white" placeholder="Name of previous school" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</Label>
                <Input {...register(`previousSchools.${index}.address` as any)} className="h-12 rounded-2xl border-2 border-primary/60 font-bold bg-white" placeholder="School location" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From (Year)</Label>
                  <Input {...register(`previousSchools.${index}.fromYear` as any)} className="h-12 rounded-2xl border-2 border-primary/60 font-bold bg-white" placeholder="2020" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">To (Year)</Label>
                  <Input {...register(`previousSchools.${index}.toYear` as any)} className="h-12 rounded-2xl border-2 border-primary/60 font-bold bg-white" placeholder="2023" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 text-xs font-medium text-muted-foreground italic">
        * Please list schools attended in reverse chronological order (most recent first).
      </div>
    </CardContent>
  );
}

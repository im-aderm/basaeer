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
import { Plus, Trash2 } from "lucide-react";

export function PreviousSchool() {
  const { formData, updateFormData } = useAdmissionStore();
  
  const { register, control, watch } = useForm<Partial<AdmissionFormData>>({
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
    <CardContent className="p-6 md:p-8 space-y-6">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Previous School</h3>
        <p className="text-sm text-muted-foreground">List schools the student has attended, starting with the most recent.</p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-5 bg-muted/30 rounded-xl relative">
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>School Name</Label>
                <Input {...register(`previousSchools.${index}.institutionName` as any)} className="h-10 rounded-lg" placeholder="Name of previous school" />
              </div>
              <div className="space-y-1">
                <Label>Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input {...register(`previousSchools.${index}.address` as any)} className="h-10 rounded-lg" placeholder="City, State" />
              </div>
              <div className="space-y-1">
                <Label>From Year</Label>
                <Input {...register(`previousSchools.${index}.fromYear` as any)} className="h-10 rounded-lg" placeholder="2020" />
              </div>
              <div className="space-y-1">
                <Label>To Year</Label>
                <Input {...register(`previousSchools.${index}.toYear` as any)} className="h-10 rounded-lg" placeholder="2023" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={() => append({ institutionName: "", address: "", fromYear: "", toYear: "" })}
        className="rounded-lg w-full"
      >
        <Plus size={16} className="mr-1" /> Add Another School
      </Button>
    </CardContent>
  );
}

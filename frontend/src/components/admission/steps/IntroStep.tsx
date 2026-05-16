"use client";

import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { School, Target, BookOpen, Star } from "lucide-react";
import { useAdmissionStore } from "@/context/useAdmissionStore";
import { BranchService } from "@/services/branchService";

interface ActiveBranch {
  id: string;
  name: string;
  code: string;
}

export function IntroStep() {
  const { formData, updateFormData } = useAdmissionStore();
  const [branches, setBranches] = useState<ActiveBranch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BranchService.getActive()
      .then(setBranches)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CardContent className="p-8 space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black italic tracking-tight text-primary uppercase">Welcome to Basaer</h2>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
          We are committed to providing a holistic education that blends Quranic values with modern science and technology.
        </p>
      </div>

      {/* Campus & Admission Type Selection */}
      <div className="p-8 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-8">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Select Campus *
          </Label>
          <Select
            value={formData.desiredBranchId}
            onValueChange={(v) => {
              updateFormData({ desiredBranchId: v });
              updateFormData({ branchId: v });
            }}
          >
            <SelectTrigger className="h-14 rounded-[1.5rem] border-2 border-primary/60 font-black italic shadow-sm">
              <SelectValue placeholder={loading ? "Loading campuses..." : "Which campus are you applying to?"} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id} className="font-bold">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 block">
            Admission Type *
          </Label>
          <RadioGroup
            value={formData.admissionType || "NEW"}
            onValueChange={(v) => updateFormData({ admissionType: v as "NEW" | "TRANSFER" })}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="NEW" id="new" />
              <Label htmlFor="new" className="font-bold italic">Fresh Admission</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="TRANSFER" id="transfer" />
              <Label htmlFor="transfer" className="font-bold italic">Transfer</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex gap-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black italic uppercase text-sm">Vision & Mission</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To raise a generation of god-fearing, competent, and socially responsible leaders through excellence in Quranic and Science education.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black italic uppercase text-sm">Triple Curriculum</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our unique approach combines British, Nigerian, and Islamic Curricula, ensuring our students are globally competitive and spiritually grounded.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-muted rounded-[3rem] border border-border space-y-4">
        <div className="flex items-center gap-2 text-primary font-black italic uppercase text-sm">
          <Star size={18} fill="currentColor" />
          Admission Requirements
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-muted-foreground list-disc pl-5">
          <li>Completed Online Application Form</li>
          <li>Passport Photograph</li>
          <li>Birth Certificate</li>
          <li>Latest School Progress Report</li>
          <li>Transfer Certificate (if applicable)</li>
          <li>Evidence of Admission Fee Payment</li>
        </ul>
      </div>
    </CardContent>
  );
}

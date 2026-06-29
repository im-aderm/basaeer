"use client";

import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { School, Target, BookOpen, FileCheck } from "lucide-react";
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
    <CardContent className="p-6 md:p-8 space-y-8">
      {/* Campus & Admission Type */}
      <div className="space-y-6 p-6 bg-muted/30 rounded-xl">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Select Campus
          </Label>
          <Select
            value={formData.desiredBranchId}
            onValueChange={(v) => {
              updateFormData({
                desiredBranchId: v,
                branchId: v,
                desiredClassId: "",
                desiredSectionId: "",
                academicSessionId: "",
              });
            }}
          >
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue placeholder={loading ? "Loading campuses..." : "Choose a campus"} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground block">
            Admission Type
          </Label>
          <RadioGroup
            value={formData.admissionType || "NEW"}
            onValueChange={(v) => updateFormData({ admissionType: v as "NEW" | "TRANSFER" })}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="NEW" id="new" />
              <Label htmlFor="new" className="font-medium cursor-pointer">Fresh Admission</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="TRANSFER" id="transfer" />
              <Label htmlFor="transfer" className="font-medium cursor-pointer">Transfer</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-3 p-4 bg-muted/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Target size={18} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Vision & Mission</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To raise a generation of god-fearing, competent, and socially responsible leaders through excellence in Quranic and Science education.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-muted/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Triple Curriculum</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our unique approach combines British, Nigerian, and Islamic Curricula, ensuring our students are globally competitive and spiritually grounded.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-5 bg-muted/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <FileCheck size={16} className="text-primary" />
          Admission Requirements
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Completed Online Application
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Passport Photograph
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Birth Certificate
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Latest School Report
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Transfer Certificate (if applicable)
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Admission Fee Payment
          </li>
        </ul>
      </div>
    </CardContent>
  );
}

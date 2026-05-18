"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, ShieldAlert } from "lucide-react";

export function ConductStep() {
  const { formData, updateFormData } = useAdmissionStore();

  return (
    <CardContent className="p-6 md:p-8 space-y-6">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Code of Conduct</h3>
        <p className="text-sm text-muted-foreground">Please review the school's code of conduct and acknowledge your agreement.</p>
      </div>

      {/* Rules content */}
      <div className="p-5 bg-muted/30 rounded-xl">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h4 className="text-foreground font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary" /> Spiritual Commitment
              </h4>
              <p>Students must participate in all daily Quranic memorization sessions and congregational prayers. Respect for Islamic values is paramount.</p>
            </section>

            <section className="space-y-2">
              <h4 className="text-foreground font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary" /> Academic Integrity
              </h4>
              <p>Excellence is our standard. Students must maintain progress in both the Science and Triple Curriculum. Cheating or plagiarism will result in immediate disciplinary action.</p>
            </section>

            <section className="space-y-2">
              <h4 className="text-foreground font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary" /> Discipline & Respect
              </h4>
              <p>Bullying, insubordination, or damage to school property is strictly prohibited. Students are expected to show respect to teachers, staff, and fellow peers at all times.</p>
            </section>

            <section className="space-y-2">
              <h4 className="text-foreground font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary" /> Uniform & Appearance
              </h4>
              <p>Modesty is required. The school uniform must be worn correctly at all times on campus. Specialized attire for Quranic sessions must also be adhered to.</p>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Agreement checkbox */}
      <div
        className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 cursor-pointer transition-colors hover:bg-primary/10"
        onClick={() => updateFormData({ schoolRulesAgreement: !formData.schoolRulesAgreement })}
      >
        <Checkbox 
          id="rules" 
          checked={formData.schoolRulesAgreement} 
          onCheckedChange={(v) => updateFormData({ schoolRulesAgreement: v === true })}
          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white w-5 h-5"
        />
        <Label htmlFor="rules" className="text-sm font-medium cursor-pointer">
          I have read and agree to all school rules and the code of conduct
        </Label>
      </div>
    </CardContent>
  );
}

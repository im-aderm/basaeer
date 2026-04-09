"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, ShieldAlert, CheckCircle2 } from "lucide-react";

export function ConductStep() {
  const { formData, updateFormData } = useAdmissionStore();

  return (
    <CardContent className="p-8 space-y-8">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Scale size={24} />
        </div>
        <h2 className="text-3xl font-black italic uppercase">Code of Conduct</h2>
      </div>

      <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-6">
        <ScrollArea className="h-[400px] pr-6">
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-medium italic">
            <section className="space-y-3">
              <h4 className="text-primary font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                <ShieldAlert size={18} /> 01. Spiritual Commitment
              </h4>
              <p>Students must participate in all daily Quranic memorization sessions and congregational prayers. Respect for Islamic values is paramount.</p>
            </section>

            <section className="space-y-3">
              <h4 className="text-primary font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                <ShieldAlert size={18} /> 02. Academic Integrity
              </h4>
              <p>Excellence is our standard. Students must maintain progress in both the Science and Triple Curriculum. Cheating or plagiarism will result in immediate disciplinary action.</p>
            </section>

            <section className="space-y-3">
              <h4 className="text-primary font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                <ShieldAlert size={18} /> 03. Discipline & Respect
              </h4>
              <p>Bullying, insubordination, or damage to school property is strictly prohibited. Students are expected to show respect to teachers, staff, and fellow peers at all times.</p>
            </section>

            <section className="space-y-3">
              <h4 className="text-primary font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                <ShieldAlert size={18} /> 04. Uniform & Appearance
              </h4>
              <p>Modesty is required. The school uniform must be worn correctly at all times on campus. Specialized attire for Quranic sessions must also be adhered to.</p>
            </section>

            <section className="p-8 bg-white/50 rounded-3xl border border-primary/10 text-xs font-bold uppercase tracking-widest leading-loose">
              By proceeding, the parent/guardian acknowledges they have read the full student handbook and agree to support the school in maintain these standards.
            </section>
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center space-x-4 p-8 bg-primary rounded-[2rem] text-white shadow-xl shadow-primary/30 cursor-pointer transition-transform hover:scale-[1.02]"
           onClick={() => updateFormData({ schoolRulesAgreement: !formData.schoolRulesAgreement })}>
        <Checkbox 
          id="rules" 
          checked={formData.schoolRulesAgreement} 
          onCheckedChange={(v) => updateFormData({ schoolRulesAgreement: v === true })}
          className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary w-6 h-6 rounded-lg"
        />
        <Label htmlFor="rules" className="text-sm font-black italic cursor-pointer uppercase tracking-tight">
          I have read and agree to all school rules and the code of conduct
        </Label>
        {formData.schoolRulesAgreement && <CheckCircle2 size={24} className="ml-auto animate-in zoom-in" />}
      </div>
    </CardContent>
  );
}

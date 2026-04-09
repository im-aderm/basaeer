"use client";

import { CardContent } from "@/components/ui/card";
import { School, Target, BookOpen, Star } from "lucide-react";

export function IntroStep() {
  return (
    <CardContent className="p-8 space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black italic tracking-tight text-primary uppercase">Welcome to Basaeer</h2>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
          We are committed to providing a holistic education that blends Quranic values with modern science and technology.
        </p>
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
          <li>Passport Photographs (4 copies)</li>
          <li>Photocopy of Birth Certificate</li>
          <li>Latest School Progress Report</li>
          <li>Transfer Certificate (if applicable)</li>
          <li>Evidence of Admission Fee Payment</li>
        </ul>
      </div>
    </CardContent>
  );
}

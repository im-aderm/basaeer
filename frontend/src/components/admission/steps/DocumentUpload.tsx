"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadFieldProps {
  label: string;
  field: string;
  value?: string;
  required?: boolean;
}

function UploadField({ label, field, value, required }: UploadFieldProps) {
  const { updateFormData } = useAdmissionStore();

  const handleMockUpload = () => {
    // In production, this would open a file picker and upload to cloud storage
    const mockUrl = `https://storage.basaeer.edu/uploads/${field}_${Date.now()}.pdf`;
    updateFormData({ [field]: mockUrl });
    toast.success(`${label} uploaded successfully (Demo)`);
  };

  return (
    <div className="flex flex-col gap-3 p-6 bg-muted/30 rounded-[2rem] border border-border transition-all hover:border-primary/30">
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label} {required && "*"}
      </Label>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleMockUpload}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary hover:text-primary transition-all font-bold text-sm"
        >
          <FileUp size={18} />
          {value ? "Change File" : "Choose File"}
        </button>
        {value ? (
          <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase">
            <CheckCircle2 size={16} /> Attached
          </div>
        ) : (
          required && (
            <div className="flex items-center gap-1.5 text-amber-500 font-black text-[10px] uppercase">
              <AlertCircle size={16} /> Required
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function DocumentUpload() {
  const { formData } = useAdmissionStore();

  return (
    <CardContent className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black italic uppercase tracking-tight">Upload Documents</h3>
        <p className="text-sm text-muted-foreground font-medium">Please provide clear scans or photos of the following (PDF, JPG, or PNG).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadField label="Passport Photograph" field="passportPhoto" value={formData.passportPhoto} required />
        <UploadField label="Birth Certificate" field="birthCertificateUrl" value={formData.birthCertificateUrl} required />
        <UploadField label="NIN Slip" field="ninUrl" value={formData.ninUrl} />
        <UploadField label="Last School Report" field="schoolReportUrl" value={formData.schoolReportUrl} required />
        <UploadField label="Medical Report" field="medicalReportUrl" value={formData.medicalReportUrl} />
        <UploadField label="Recommendation Letter" field="recommendationLetterUrl" value={formData.recommendationLetterUrl} />
        <UploadField label="Transfer Letter" field="transferLetterUrl" value={formData.transferLetterUrl} />
      </div>

      <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20 text-xs font-medium text-amber-600 italic flex gap-3 items-center">
        <AlertCircle size={20} className="shrink-0" />
        Ensure filenames are clear and files are not larger than 5MB each.
      </div>
    </CardContent>
  );
}

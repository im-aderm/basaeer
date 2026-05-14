"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { FileUp, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import api from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface UploadFieldProps {
  label: string;
  field: string;
  value?: string;
  required?: boolean;
  category?: string;
}

function UploadField({ label, field, value, required, category }: UploadFieldProps) {
  const { updateFormData } = useAdmissionStore();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${label}: Only JPEG, PNG, WebP images and PDF files are allowed`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${label}: File size must be under 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = category
        ? `/upload/admission-document?category=${encodeURIComponent(category)}`
        : "/upload/admission-document";

      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const fileUrl = response.data.url;
        updateFormData({ [field]: fileUrl });

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => setPreview(ev.target?.result as string);
          reader.readAsDataURL(file);
        }

        toast.success(`${label} uploaded successfully`);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Upload error:", error);
      const message = error.response?.data?.message || "Upload failed. Please try again.";
      toast.error(`${label}: ${message}`);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateFormData({ [field]: undefined });
    setPreview(null);
    toast.info(`${label} removed`);
  };

  return (
    <div className="flex flex-col gap-3 p-6 bg-muted/30 rounded-[2rem] border border-border transition-all hover:border-primary/30">
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label} {required && "*"}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:text-primary transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Upload size={18} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp size={18} />
              {value ? "Change File" : "Choose File"}
            </>
          )}
        </button>

        {value ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase">
              <CheckCircle2 size={16} /> Attached
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          required && (
            <div className="flex items-center gap-1.5 text-amber-500 font-black text-[10px] uppercase">
              <AlertCircle size={16} /> Required
            </div>
          )
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-2 relative">
          <img
            src={preview}
            alt={`${label} preview`}
            className="w-full h-32 object-cover rounded-xl border border-border"
          />
        </div>
      )}

      {value && value.endsWith(".pdf") && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <FileUp size={14} />
          <span className="truncate">{value.split("/").pop()}</span>
        </div>
      )}
    </div>
  );
}

export function DocumentUpload() {
  const { formData } = useAdmissionStore();

  return (
    <CardContent className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black italic uppercase tracking-tight">Upload Documents</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Please provide clear scans or photos of the following (PDF, JPG, or PNG, max 5MB each).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadField label="Passport Photograph" field="passportPhoto" value={formData.passportPhoto} required category="passport" />
        <UploadField label="Birth Certificate" field="birthCertificateUrl" value={formData.birthCertificateUrl} required category="birth-certificate" />
        <UploadField label="NIN Slip" field="ninUrl" value={formData.ninUrl} category="nin" />
        <UploadField label="Last School Report" field="schoolReportUrl" value={formData.schoolReportUrl} required category="school-report" />
        <UploadField label="Medical Report" field="medicalReportUrl" value={formData.medicalReportUrl} category="medical" />
        <UploadField label="Recommendation Letter" field="recommendationLetterUrl" value={formData.recommendationLetterUrl} category="recommendation" />
        {formData.admissionType === "TRANSFER" && (
          <>
            <UploadField label="Transfer Letter" field="transferLetterUrl" value={formData.transferLetterUrl} category="transfer" />
            <UploadField label="Transfer Certificate" field="transferCertificateUrl" value={formData.transferCertificateUrl} category="transfer" />
          </>
        )}
      </div>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 text-xs font-medium text-primary italic flex gap-3 items-center">
        <AlertCircle size={20} className="shrink-0" />
        Ensure all documents are clear and readable. Maximum file size: 5MB per file.
      </div>
    </CardContent>
  );
}

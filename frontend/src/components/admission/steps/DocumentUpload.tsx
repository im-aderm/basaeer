"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { FileUp, CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";
import api from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PASSPORT_MAX_SIZE = 200 * 1024; // 200KB
const PASSPORT_WIDTH = 300;
const PASSPORT_HEIGHT = 300;
const WHITE_THRESHOLD = 240;
const WHITE_PIXEL_RATIO = 0.8;
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
  isPassport?: boolean;
}

function UploadField({ label, field, value, required, category, isPassport }: UploadFieldProps) {
  const { updateFormData } = useAdmissionStore();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [passportValidation, setPassportValidation] = useState<{
    sizeOk: boolean;
    dimensionsOk: boolean;
    backgroundOk: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validatePassportPhoto = useCallback(async (file: File): Promise<boolean> => {
    // Check file size
    if (file.size > PASSPORT_MAX_SIZE) {
      toast.error(`${label}: Photo must be under 200KB (current: ${(file.size / 1024).toFixed(1)}KB)`);
      setPassportValidation({ sizeOk: false, dimensionsOk: false, backgroundOk: false });
      return false;
    }

    // Check dimensions
    const img = new Image();
    const imgLoad = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    try {
      const loadedImg = await imgLoad;
      const width = loadedImg.naturalWidth;
      const height = loadedImg.naturalHeight;

      if (width !== PASSPORT_WIDTH || height !== PASSPORT_HEIGHT) {
        toast.error(`${label}: Photo must be exactly ${PASSPORT_WIDTH}×${PASSPORT_HEIGHT}px (current: ${width}×${height}px)`);
        setPassportValidation({ sizeOk: true, dimensionsOk: false, backgroundOk: false });
        return false;
      }

      // Check white background using canvas
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPassportValidation({ sizeOk: true, dimensionsOk: true, backgroundOk: true });
        return true;
      }

      ctx.drawImage(loadedImg, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const borderX = Math.floor(width * 0.15);
      const borderY = Math.floor(height * 0.15);
      let whitePixels = 0;
      let totalBorderPixels = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (x < borderX || x >= width - borderX || y < borderY || y >= height - borderY) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
              whitePixels++;
            }
            totalBorderPixels++;
          }
        }
      }

      const whiteRatio = whitePixels / totalBorderPixels;
      const backgroundOk = whiteRatio >= WHITE_PIXEL_RATIO;

      if (!backgroundOk) {
        toast.warning(`${label}: Background appears non-white (${Math.round(whiteRatio * 100)}% white). Please use a white background for best results.`);
      }

      setPassportValidation({ sizeOk: true, dimensionsOk: true, backgroundOk });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Photo validation error:", error);
      toast.error(`${label}: Unable to validate photo. Please try another file.`);
      return false;
    }
  }, [label]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${label}: Only JPEG, PNG, WebP images and PDF files are allowed`);
      return;
    }

    // Validate file size (general)
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${label}: File size must be under 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    // Passport-specific validation
    if (isPassport && file.type.startsWith("image/")) {
      const isValid = await validatePassportPhoto(file);
      if (!isValid) return;
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateFormData({ [field]: undefined });
    setPreview(null);
    setPassportValidation(null);
    toast.info(`${label} removed`);
  };

  return (
    <div className="flex flex-col gap-3 p-6 bg-muted/30 rounded-[2rem] border border-border transition-all hover:border-primary/60">
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
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-primary/60 rounded-xl hover:border-primary hover:text-primary transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Passport Photo Validation Badges */}
      {isPassport && passportValidation && (
        <div className="mt-2 p-3 bg-muted/20 rounded-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <ImageIcon size={12} /> Photo Validation
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${passportValidation.sizeOk ? 'text-green-500' : 'text-red-500'}`}>
              {passportValidation.sizeOk ? <CheckCircle2 size={14} /> : <X size={14} />}
              ≤200KB
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${passportValidation.dimensionsOk ? 'text-green-500' : 'text-red-500'}`}>
              {passportValidation.dimensionsOk ? <CheckCircle2 size={14} /> : <X size={14} />}
              300×300px
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${passportValidation.backgroundOk ? 'text-green-500' : 'text-amber-500'}`}>
              {passportValidation.backgroundOk ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              White BG
            </div>
          </div>
        </div>
      )}

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

      {/* Hidden canvas for background analysis */}
      <canvas ref={canvasRef} className="hidden" />
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
        <p className="text-xs font-bold text-amber-600 bg-amber-500/10 inline-block px-3 py-1 rounded-full">
          Passport photo must be ≤200KB, exactly 300×300px, with white background.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadField label="Passport Photograph" field="passportPhoto" value={formData.passportPhoto} required category="passport" isPassport />
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

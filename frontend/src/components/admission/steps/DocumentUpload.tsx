"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { FileUp, CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import { useState, useRef, useCallback } from "react";
import api from "@/lib/api";

const MAX_FILE_SIZE = 500 * 1024;
const COMPRESSION_QUALITY = 0.7;
const PASSPORT_MAX_SIZE = 200 * 1024;
const PASSPORT_WIDTH = 400;
const PASSPORT_HEIGHT = 400;
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
  category?: string;
  isPassport?: boolean;
}

function compressImage(file: File, quality = COMPRESSION_QUALITY): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > 1200) {
        height = Math.round((height * 1200) / width);
        width = 1200;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const ext = file.type.split("/")[1] || "jpeg";
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
            type: file.type,
          });
          resolve(compressed);
        },
        file.type,
        quality,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

function UploadField({ label, field, value, category, isPassport }: UploadFieldProps) {
  const { updateFormData } = useAdmissionStore();
  const { showSuccess, showError, showInfo } = useNotification();
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
    if (file.size > PASSPORT_MAX_SIZE) {
      showError(`${label}: Photo must be under 200KB (current: ${(file.size / 1024).toFixed(1)}KB)`);
      setPassportValidation({ sizeOk: false, dimensionsOk: false, backgroundOk: false });
      return false;
    }

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

      if (width > PASSPORT_WIDTH || height > PASSPORT_HEIGHT) {
        showError(`${label}: Photo must be at most ${PASSPORT_WIDTH}×${PASSPORT_HEIGHT}px (current: ${width}×${height}px)`);
        setPassportValidation({ sizeOk: true, dimensionsOk: false, backgroundOk: false });
        return false;
      }

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
        showInfo(`${label}: Background appears non-white (${Math.round(whiteRatio * 100)}% white). Please use a white background.`);
      }

      setPassportValidation({ sizeOk: true, dimensionsOk: true, backgroundOk });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Photo validation error:", error);
      showError(`${label}: Unable to validate photo. Please try another file.`);
      return false;
    }
  }, [label]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(`${label}: Only JPEG, PNG, WebP images and PDF files are allowed`);
      return;
    }

    let targetFile = file;

    if (file.size > MAX_FILE_SIZE) {
      if (file.type.startsWith("image/")) {
        showInfo(`${label}: Compressing image to reduce file size...`);
        const compressed = await compressImage(file);
        if (compressed.size < file.size) {
          targetFile = compressed;
          showSuccess(`${label}: Compressed from ${(file.size / 1024).toFixed(0)}KB to ${(compressed.size / 1024).toFixed(0)}KB`);
        }
      }

      if (targetFile.size > MAX_FILE_SIZE) {
        showError(
          `${label}: File must be under 500KB after compression. Tips to reduce size:\n` +
          `• Use tinypng.com or iloveimg.com to compress\n` +
          `• Crop the image to show only the document\n` +
          `• Take a clearer photo with good lighting\n` +
          `• Convert to JPEG instead of PNG\n` +
          `Current: ${(targetFile.size / 1024).toFixed(0)}KB`
        );
        return;
      }
    }

    if (isPassport && targetFile.type.startsWith("image/")) {
      const isValid = await validatePassportPhoto(targetFile);
      if (!isValid) return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", targetFile);

      const url = category
        ? `/upload/admission-document?category=${encodeURIComponent(category)}`
        : "/upload/admission-document";

      const response = await api.post(url, formData);

      if (response.data.success) {
        const fileUrl = response.data.url;
        updateFormData({ [field]: fileUrl });

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => setPreview(ev.target?.result as string);
          reader.readAsDataURL(file);
        }

        showSuccess(`${label} uploaded`);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Upload error:", error);
      const message = error.response?.data?.message || "Upload failed. Please try again.";
      showError(`${label}: ${message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateFormData({ [field]: undefined });
    setPreview(null);
    setPassportValidation(null);
    showInfo(`${label} removed`);
  };

  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border">
      <Label className="text-sm font-medium text-foreground mb-3 block">
        {label}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium flex-1">
            <CheckCircle2 size={16} /> Uploaded
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 w-full h-10 px-3 bg-white border border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Upload size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp size={16} />
              Choose file
            </>
          )}
        </button>
      )}

      {/* Passport validation badges */}
      {isPassport && passportValidation && (
        <div className="mt-3 flex gap-3 text-xs">
          <span className={passportValidation.sizeOk ? 'text-emerald-600' : 'text-destructive'}>
            {passportValidation.sizeOk ? '✓' : '✗'} ≤200KB
          </span>
          <span className={passportValidation.dimensionsOk ? 'text-emerald-600' : 'text-destructive'}>
            {passportValidation.dimensionsOk ? '✓' : '✗'} ≤400×400px
          </span>
          <span className={passportValidation.backgroundOk ? 'text-emerald-600' : 'text-amber-600'}>
            {passportValidation.backgroundOk ? '✓' : '⚠'} White BG
          </span>
        </div>
      )}

      {/* Image preview */}
      {preview && (
        <img
          src={preview}
          alt={`${label} preview`}
          className="mt-3 w-full h-24 object-cover rounded-lg border border-border"
        />
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export function DocumentUpload() {
  const { formData } = useAdmissionStore();

  return (
    <CardContent className="p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Document Uploads</h3>
        <p className="text-sm text-muted-foreground">Upload clear scans or photos (PDF, JPG, PNG, WebP, max 500KB each). Fields marked * are required.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadField label="Passport Photograph *" field="passportPhoto" value={formData.passportPhoto} category="passport" isPassport />
        <UploadField label="Birth Certificate *" field="birthCertificateUrl" value={formData.birthCertificateUrl} category="birth-certificate" />
        <UploadField label="NIN Slip" field="ninUrl" value={formData.ninUrl} category="nin" />
        <UploadField label="Last School Report" field="schoolReportUrl" value={formData.schoolReportUrl} category="school-report" />
        <UploadField label="Medical Report" field="medicalReportUrl" value={formData.medicalReportUrl} category="medical" />
        <UploadField label="Recommendation Letter" field="recommendationLetterUrl" value={formData.recommendationLetterUrl} category="recommendation" />
        {formData.admissionType === "TRANSFER" && (
          <>
            <UploadField label="Transfer Letter" field="transferLetterUrl" value={formData.transferLetterUrl} category="transfer" />
            <UploadField label="Transfer Certificate" field="transferCertificateUrl" value={formData.transferCertificateUrl} category="transfer" />
          </>
        )}
      </div>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-2 items-start">
        <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Ensure all documents are clear and readable. You can upload documents later if needed.
        </p>
      </div>
    </CardContent>
  );
}

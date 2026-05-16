"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Building2,
  User,
  Hash,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useRef } from "react";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { BranchService } from "@/services/branchService";
import api from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function PaymentStep() {
  const { formData, updateFormData } = useAdmissionStore();
  const [initData, setInitData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await BranchService.getActive();
        setBranches(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Failed to load branches", error);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (formData.branchId) {
        try {
          const data = await OnlineAdmissionService.getPublicInitData(formData.branchId);
          setInitData(data);
          if (data.currentSession && !formData.academicSessionId) {
            updateFormData({ academicSessionId: data.currentSession.id });
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error("Failed to load init data", error);
        }
      }
    };
    loadData();
  }, [formData.branchId, formData.academicSessionId, updateFormData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP images and PDF files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be under 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload/payment-proof", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const fileUrl = response.data.url;
        updateFormData({ paymentProofUrl: fileUrl });

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => setPreview(ev.target?.result as string);
          reader.readAsDataURL(file);
        }

        toast.success("Payment proof uploaded successfully");
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Upload error:", error);
      const message = error.response?.data?.message || "Upload failed. Please try again.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateFormData({ paymentProofUrl: undefined });
    setPreview(null);
    toast.info("Payment proof removed");
  };

  const selectedClassId = formData.desiredClassId;
  const sections = selectedClassId && initData?.sections ? initData.sections[selectedClassId] : null;

  return (
    <CardContent className="p-8 space-y-10">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CreditCard size={24} />
        </div>
        <h2 className="text-3xl font-black italic uppercase">Payment & Class Selection</h2>
      </div>

      <div className="flex items-center gap-3">
        <School size={20} className="text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Admission Type:
        </span>
        <span className="px-4 py-1 rounded-full bg-primary/10 border-2 border-primary/60 text-primary font-black italic text-sm">
          {formData.admissionType === "NEW" ? "New Admission" : "Transfer"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Campus / Branch *
          </Label>
          <Select
            value={formData.desiredBranchId}
            onValueChange={(v) => updateFormData({ desiredBranchId: v })}
          >
            <SelectTrigger className="h-14 rounded-[1.5rem] border-2 border-primary/60 font-black italic shadow-sm">
              <SelectValue placeholder="Select your campus" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {branches.map((b: any) => (
                <SelectItem key={b.id} value={b.id} className="font-bold">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Applying for Class *
          </Label>
          <Select
            value={formData.desiredClassId}
            onValueChange={(v) => updateFormData({ desiredClassId: v })}
          >
            <SelectTrigger className="h-14 rounded-[1.5rem] border-2 border-primary/60 font-black italic shadow-sm">
              <SelectValue placeholder="Which class/grade?" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {initData?.classes.map((c: any) => (
                <SelectItem key={c.id} value={c.id} className="font-bold">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Section
          </Label>
          <Select
            value={formData.desiredSectionId}
            onValueChange={(v) => updateFormData({ desiredSectionId: v })}
            disabled={!sections}
          >
            <SelectTrigger className="h-14 rounded-[1.5rem] border-2 border-primary/60 font-black italic shadow-sm">
              <SelectValue placeholder={sections && sections.length > 0 ? "Select section" : "No sections available"} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {sections?.length > 0 ? sections.map((s: any) => (
                <SelectItem key={s.id} value={s.id} className="font-bold">
                  {s.name}
                </SelectItem>
              )) : (
                <SelectItem value="none" disabled className="font-bold text-muted-foreground">
                  No sections available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Academic Session *
          </Label>
          <div className="h-14 rounded-[1.5rem] bg-muted/30 border-2 border-primary/60 flex items-center px-6 font-black italic text-primary">
            {initData?.currentSession?.name || "Loading..."}
          </div>
        </div>
      </div>

      <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-8 shadow-inner">
        <div className="text-center space-y-2">
          <p className="font-black text-primary italic uppercase tracking-[0.3em] text-xs">
            Bank Transfer Details
          </p>
          <p className="text-3xl font-black italic uppercase">{initData?.admissionFee ? `₦${Number(initData.admissionFee).toLocaleString()} Admission Fee` : 'Admission Fee'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <Building2 className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Bank</span>
            <span className="text-lg font-black italic uppercase">{initData?.bankDetails?.bankName || '—'}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <Hash className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Account</span>
            <span className="text-lg font-black italic tracking-wider">{initData?.bankDetails?.accountNumber || '—'}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <User className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Name</span>
            <span className="text-sm font-black italic uppercase leading-tight text-center">
              {initData?.bankDetails?.accountName || initData?.branchName || '—'}
            </span>
          </div>
        </div>

        {formData.desiredClassId && (
          <div className="flex justify-center flex-col items-center gap-6 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`group relative flex flex-col items-center justify-center gap-3 w-full md:w-80 h-40 bg-white border-4 border-dashed border-primary/20 rounded-[2.5rem] hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <Upload size={40} className="animate-spin" />
                  <span className="font-black italic uppercase tracking-tight">Uploading...</span>
                </>
              ) : (
                <>
                  <FileUp size={40} className="group-hover:-translate-y-2 transition-transform duration-300" />
                  <span className="font-black italic uppercase tracking-tight">
                    {formData.paymentProofUrl ? "Change Payment Proof" : "Upload Proof of Payment"}
                  </span>
                </>
              )}

              {formData.paymentProofUrl && !uploading && (
                <div className="absolute inset-0 bg-white/90 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={48} className="text-green-500" />
                  <span className="text-green-600 font-black italic uppercase text-xs">Proof Uploaded</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {preview && (
              <img
                src={preview}
                alt="Payment proof preview"
                className="w-48 h-32 object-cover rounded-xl border-2 border-primary/20 shadow-lg"
              />
            )}

            <div className="flex items-center gap-2 text-primary font-bold italic text-xs uppercase opacity-70">
              <AlertCircle size={16} /> Screenshot or PDF of transfer (max 5MB)
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}

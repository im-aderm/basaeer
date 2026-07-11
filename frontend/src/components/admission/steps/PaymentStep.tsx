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
  Upload,
  X,
  School,
  Loader2,
} from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useRef } from "react";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { BranchService } from "@/services/branchService";
import api from "@/lib/api";

const MAX_FILE_SIZE = 500 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function PaymentStep() {
  const { formData, updateFormData } = useAdmissionStore();
  const { showSuccess, showError, showInfo } = useNotification();
  const [initData, setInitData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const branchId = formData.desiredBranchId || formData.branchId;
      if (branchId) {
        setLoading(true);
        try {
          const data = await OnlineAdmissionService.getPublicInitData(branchId);
          setInitData(data);
          if (data.currentSession && !formData.academicSessionId) {
            updateFormData({ academicSessionId: data.currentSession.id });
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error("Failed to load init data", error);
          setInitData({ classes: [], sessions: [] });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [formData.desiredBranchId, formData.branchId]);

  const handleBranchChange = (v: string) => {
    updateFormData({
      desiredBranchId: v,
      branchId: v,
      academicSessionId: "",
    });
    setInitData(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Only JPEG, PNG, WebP images and PDF files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError(`File size must be under 500KB (${(file.size / 1024).toFixed(0)}KB). Use tinypng.com or iloveimg.com to compress.`);
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload/payment-proof", formDataUpload);

      if (response.data.success) {
        const fileUrl = response.data.url;
        updateFormData({ paymentProofUrl: fileUrl });

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => setPreview(ev.target?.result as string);
          reader.readAsDataURL(file);
        }

        showSuccess("Payment proof uploaded successfully");
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error("Upload error:", error);
      const message = error.response?.data?.message || "Upload failed. Please try again.";
      showError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateFormData({ paymentProofUrl: undefined });
    setPreview(null);
    showInfo("Payment proof removed");
  };

  const hasBranch = !!formData.desiredBranchId;
  const isLoading = loading;
  const hasSessions = initData && Array.isArray(initData.sessions);

  return (
    <CardContent className="p-6 md:p-8 space-y-8">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Payment & Submission</h3>
        <p className="text-sm text-muted-foreground">Select your campus and session, then complete the admission fee payment.</p>
      </div>

      {/* Admission type badge */}
      <div className="flex items-center gap-2">
        <School size={16} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Admission Type:</span>
        <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">
          {formData.admissionType === "NEW" ? "New Admission" : "Transfer"}
        </span>
      </div>

      {/* Campus & Session */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch */}
        <div className="space-y-1">
          <Label>Campus</Label>
          <Select
            value={formData.desiredBranchId}
            onValueChange={handleBranchChange}
          >
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Select campus" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Session */}
        <div className="space-y-1">
          <Label>Academic Session</Label>
          {isLoading ? (
            <div className="h-10 rounded-lg bg-muted/30 border border-border flex items-center px-3">
              <Loader2 size={14} className="animate-spin mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : hasSessions && initData.sessions.length > 0 ? (
            <Select
              value={formData.academicSessionId}
              onValueChange={(v) => updateFormData({ academicSessionId: v })}
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {initData.sessions.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}{s.isActive ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : hasBranch ? (
            <div className="h-10 rounded-lg bg-muted/30 border border-border flex items-center px-3 text-sm text-muted-foreground">
              No sessions configured
            </div>
          ) : (
            <div className="h-10 rounded-lg bg-muted/30 border border-border flex items-center px-3 text-sm text-muted-foreground">
              Select campus first
            </div>
          )}
        </div>
      </div>

      {/* Payment section */}
      <div className="p-5 bg-muted/30 rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-primary" />
          <div>
            <div className="text-sm font-semibold text-foreground">Admission Fee Payment</div>
            <div className="text-2xl font-bold text-primary">
              {initData?.admissionFee ? `₦${Number(initData.admissionFee).toLocaleString()}` : '—'}
            </div>
          </div>
        </div>

        {/* Bank details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg border border-border">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Bank</div>
            <div className="text-sm font-semibold">{initData?.bankDetails?.bankName || '—'}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-border">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Account</div>
            <div className="text-sm font-semibold font-mono">{initData?.bankDetails?.accountNumber || '—'}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-border">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</div>
            <div className="text-sm font-semibold">{initData?.bankDetails?.accountName || initData?.branchName || '—'}</div>
          </div>
        </div>

        {/* Payment proof upload */}
        <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Proof <span className="text-muted-foreground font-normal">(optional)</span></Label>
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
              className={`flex flex-col items-center justify-center gap-2 w-full h-32 bg-white border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {uploading ? (
                <>
                  <Upload size={24} className="animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </>
              ) : formData.paymentProofUrl ? (
                <>
                  <FileUp size={24} className="text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">Proof uploaded — click to change</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-sm font-medium">Upload proof of payment</span>
                </>
              )}
            </div>

            {formData.paymentProofUrl && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X size={14} /> Remove
              </button>
            )}

            {preview && (
              <img
                src={preview}
                alt="Payment proof preview"
                className="w-40 h-28 object-cover rounded-lg border border-border"
              />
            )}
          </div>
      </div>
    </CardContent>
  );
}

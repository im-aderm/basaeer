"use client";

import { useAdmissionStore } from "@/context/useAdmissionStore";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { CreditCard, Building2, User, Hash, FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";

export function PaymentStep() {
  const { formData, updateFormData } = useAdmissionStore();
  const [initData, setInitData] = useState<any>(null);

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
          console.error("Failed to load init data", error);
        }
      }
    };
    loadData();
  }, [formData.branchId, formData.academicSessionId, updateFormData]);

  const handleMockUpload = () => {
    const mockUrl = `https://storage.basaeer.edu/uploads/payment_proof_${Date.now()}.jpg`;
    updateFormData({ paymentProofUrl: mockUrl });
    toast.success("Payment proof uploaded successfully (Demo)");
  };

  return (
    <CardContent className="p-8 space-y-10">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CreditCard size={24} />
        </div>
        <h2 className="text-3xl font-black italic uppercase">Payment & Class Selection</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Applying for Class *</Label>
          <Select 
            value={formData.desiredClassId} 
            onValueChange={(v) => updateFormData({ desiredClassId: v })}
          >
            <SelectTrigger className="h-14 rounded-[1.5rem] border-2 font-black italic shadow-sm">
              <SelectValue placeholder="Which class/grade?" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {initData?.classes.map((c: any) => (
                <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Session *</Label>
          <div className="h-14 rounded-[1.5rem] bg-muted/30 border-2 border-border flex items-center px-6 font-black italic text-primary">
            {initData?.currentSession?.name || "Loading..."}
          </div>
        </div>
      </div>

      <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-8 shadow-inner">
        <div className="text-center space-y-2">
          <p className="font-black text-primary italic uppercase tracking-[0.3em] text-xs">Bank Transfer Details</p>
          <p className="text-3xl font-black italic uppercase">₦5,000 Admission Fee</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <Building2 className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Bank</span>
            <span className="text-lg font-black italic uppercase">Zenith Bank</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <Hash className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Account</span>
            <span className="text-lg font-black italic tracking-wider">1234567890</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-primary/5 flex flex-col items-center">
            <User className="text-primary/40 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">Name</span>
            <span className="text-sm font-black italic uppercase leading-tight text-center">Basaeer Quranic College</span>
          </div>
        </div>

        <div className="flex justify-center flex-col items-center gap-6 pt-4">
          <button
            type="button"
            onClick={handleMockUpload}
            className="group relative flex flex-col items-center justify-center gap-3 w-full md:w-80 h-40 bg-white border-4 border-dashed border-primary/20 rounded-[2.5rem] hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
          >
            <FileUp size={40} className="group-hover:-translate-y-2 transition-transform duration-300" />
            <span className="font-black italic uppercase tracking-tight">Upload Proof of Payment</span>
            {formData.paymentProofUrl && (
              <div className="absolute inset-0 bg-white/90 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={48} className="text-green-500" />
                <span className="text-green-600 font-black italic uppercase text-xs">Proof Uploaded</span>
              </div>
            )}
          </button>
          
          <div className="flex items-center gap-2 text-primary font-bold italic text-xs uppercase opacity-70">
            <AlertCircle size={16} /> Screenshot or PDF of transfer
          </div>
        </div>
      </div>
    </CardContent>
  );
}

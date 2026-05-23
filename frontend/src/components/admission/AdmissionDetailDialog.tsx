"use client";

import { OnlineAdmission } from "@/services/onlineAdmissionService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, School, HeartPulse, FileText, CheckCircle2, XCircle, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdmissionDetailDialogProps {
  admission: OnlineAdmission | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onVerifyPayment: (id: string) => void;
}

export function AdmissionDetailDialog({ 
  admission, 
  onClose, 
  onApprove, 
  onReject, 
  onVerifyPayment 
}: AdmissionDetailDialogProps) {
  if (!admission) return null;

  return (
    <Dialog open={!!admission} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl flex flex-col">
        <DialogHeader className="p-8 bg-primary text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black italic uppercase">
                {admission.firstName} {admission.surname || admission.lastName}
              </DialogTitle>
              <div className="flex gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold uppercase tracking-widest text-[10px]">
                  {admission.desiredClass?.name || "No Class"}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold uppercase tracking-widest text-[10px]">
                  {admission.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Application Date</p>
              <p className="font-bold italic">{new Date(admission.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="space-y-12 pb-4">
            {/* Candidate Section */}
            <Section title="Candidate Information" icon={User}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DataField label="Gender" value={admission.gender} />
                <DataField label="DOB" value={new Date(admission.dateOfBirth).toLocaleDateString()} />
                <DataField label="Age" value={admission.age?.toString() || "N/A"} />
                <DataField label="NIN" value={admission.ninNumber || "N/A"} />
                <DataField label="Genotype" value={admission.genotype || "N/A"} />
                <DataField label="Blood Group" value={admission.bloodGroup || "N/A"} />
                <DataField label="Nationality" value={admission.nationality || "N/A"} />
                <DataField label="State of Origin" value={admission.stateOfOrigin || "N/A"} />
              </div>
              <DataField label="Home Address" value={admission.address || "N/A"} fullWidth />
            </Section>

            {/* Parent Info */}
            <Section title="Parent / Guardian" icon={Phone}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-muted/30 rounded-3xl">
                  <p className="text-xs font-black text-primary uppercase italic">Father</p>
                  <DataField label="Name" value={admission.fatherName || "N/A"} />
                  <DataField label="Occupation" value={admission.fatherOccupation || "N/A"} />
                  <DataField label="Phone" value={admission.fatherPhone || "N/A"} />
                </div>
                <div className="space-y-4 p-6 bg-muted/30 rounded-3xl">
                  <p className="text-xs font-black text-primary uppercase italic">Mother</p>
                  <DataField label="Name" value={admission.motherName || "N/A"} />
                  <DataField label="Occupation" value={admission.motherOccupation || "N/A"} />
                  <DataField label="Phone" value={admission.motherPhone || "N/A"} />
                </div>
              </div>
              <div className="mt-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-xs font-black text-primary uppercase italic mb-4">Primary Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataField label="Guardian Name" value={admission.guardianName} />
                  <DataField label="Email" value={admission.guardianEmail || "N/A"} />
                  <DataField label="Contact 1" value={admission.guardianPhone} />
                  <DataField label="Contact 2" value={admission.guardianContact1 || "N/A"} />
                </div>
              </div>
            </Section>

            {/* Previous School */}
            <Section title="Academic History" icon={School}>
              {admission.previousSchools && admission.previousSchools.length > 0 ? (
                <div className="space-y-4">
                  {admission.previousSchools.map((school, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm italic">{school.institutionName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{school.address}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {school.fromYear} - {school.toYear}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No previous school records provided.</p>
              )}
            </Section>

            {/* Medical */}
            <Section title="Medical & Additional" icon={HeartPulse}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <StatusCheck label="Medical Condition" checked={admission.hasMedicalCondition} info={admission.medicalConditionInfo} />
                  <StatusCheck label="Learning Difficulty" checked={admission.hasLearningDifficulty} info={admission.learningDifficultyInfo} />
                </div>
                <div className="space-y-4">
                  <StatusCheck label="Special Needs" checked={admission.hasSpecialNeeds} info={admission.specialNeedsInfo} />
                  <StatusCheck label="Financial Aid Needed" checked={admission.seekingFinancialAid} />
                </div>
              </div>
            </Section>

            {/* Documents */}
            <Section title="Documents & Payment" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentLink label="Passport Photo" url={admission.passportPhoto} />
                <DocumentLink label="Birth Certificate" url={admission.birthCertificateUrl} />
                <DocumentLink label="Last School Report" url={admission.schoolReportUrl} />
                <DocumentLink label="Payment Proof" url={admission.paymentProofUrl} isPayment />
              </div>

              <div className="mt-6 p-6 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Payment Status</p>
                  <p className="text-xl font-black italic text-primary uppercase">{admission.paymentStatus || 'PENDING'}</p>
                </div>
                {admission.paymentStatus !== 'VERIFIED' && (
                  <Button
                    onClick={() => onVerifyPayment(admission.id)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 font-black italic shadow-lg shadow-primary/20"
                  >
                    Verify Payment
                  </Button>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-muted/30 border-t border-border flex justify-end gap-4 shadow-inner flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onReject(admission.id)}
            className="rounded-2xl px-8 h-12 font-black text-destructive border-destructive/20 hover:bg-destructive/10 italic"
          >
            <XCircle className="mr-2 h-4 w-4" /> Reject Application
          </Button>
          {admission.status !== 'ENROLLED' && (
            <Button
              onClick={() => onApprove(admission.id)}
              className="rounded-2xl px-10 h-12 font-black italic bg-primary shadow-xl shadow-primary/20"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> Approve & Enrol
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Icon size={20} strokeWidth={3} />
        <h3 className="text-xl font-black italic uppercase tracking-tight">{title}</h3>
      </div>
      <div className="pl-7 space-y-4">
        {children}
      </div>
    </div>
  );
}

function DataField({ label, value, fullWidth }: any) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="font-bold text-sm leading-tight">{value}</p>
    </div>
  );
}

function StatusCheck({ label, checked, info }: any) {
  return (
    <div className="bg-muted/30 p-4 rounded-2xl border border-border">
      <div className="flex items-center gap-2">
        {checked ? <CheckCircle2 size={16} className="text-primary" /> : <XCircle size={16} className="text-muted-foreground/30" />}
        <span className="font-bold text-sm italic">{label}</span>
      </div>
      {checked && info && (
        <p className="mt-2 text-xs text-muted-foreground font-medium pl-6">{info}</p>
      )}
    </div>
  );
}

function DocumentLink({ label, url, isPayment }: any) {
  if (!url) return null;
  return (
    <a 
      href={url} 
      target="_blank" 
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isPayment ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-border text-primary'}`}
    >
      <div className="flex items-center gap-2">
        {isPayment ? <CreditCard size={18} /> : <FileText size={18} />}
        <span className="text-xs font-black uppercase italic">{label}</span>
      </div>
      <ExternalLink size={14} />
    </a>
  );
}

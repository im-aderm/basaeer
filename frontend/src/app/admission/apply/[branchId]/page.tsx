"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { ClassService, Class } from "@/services/classService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import {
    Loader2,
    User,
    School,
    ShieldCheck,
    CheckCircle2,
    MapPin,
    FileText,
    Upload,
    Save,
    CreditCard,
    Building2,
    Hash
} from "lucide-react";
import { toast } from "sonner";

export default function PublicAdmissionPage() {
    const params = useParams();
    const branchId = params.branchId as string;

    const [classes, setClasses] = useState<Class[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<any>({
        firstName: "",
        lastName: "",
        gender: "MALE",
        dateOfBirth: "",
        passportPhoto: "",
        academicSessionId: "",
        admissionTerm: "FIRST",
        desiredClassId: "",
        admissionType: "NEW",
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianAddress: "",
        address: "",
        bloodGroup: "",
        genotype: "",
        birthCertificateUrl: "",
        testimonialUrl: "",
        paymentReceiptUrl: "",
        paymentMethod: "BANK_TRANSFER",
        guardianConsent: false,
        branchId: branchId,
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Public fetch might need branchId filtering in the service/backend
                const [classAttribute, sessionAttribute] = await Promise.all([
                    ClassService.getAll(branchId),
                    SessionService.getAll()
                ]);
                setClasses(classAttribute);
                setSessions(sessionAttribute);
                if (sessionAttribute.length > 0) {
                    setFormData((prev: any) => ({
                        ...prev,
                        academicSessionId: sessionAttribute.find(s => s.isActive)?.id || sessionAttribute[0].id
                    }));
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (branchId) loadInitialData();
    }, [branchId]);

    const handleFileUpload = (field: string) => {
        const mockUrl = `https://storage.bmsms.edu/uploads/${field}_${Date.now()}.jpg`;
        setFormData({ ...formData, [field]: mockUrl });
        toast.success(`${field.replace(/([A-Z])/g, ' $1')} uploaded`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.guardianConsent) {
            toast.error("Please provide guardian consent");
            return;
        }
        if (!formData.paymentReceiptUrl) {
            toast.error("Please upload your payment receipt");
            return;
        }
        setSubmitting(true);
        try {
            await OnlineAdmissionService.create(formData);
            setSuccess(true);
        } catch (error) {
            console.error("Admission submission failed:", error);
            toast.error("Failed to submit admission application.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-500/10 text-green-500 shadow-2xl">
                        <CheckCircle2 size={64} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black tracking-tight italic">Submitted!</h2>
                        <p className="text-xl text-muted-foreground font-medium">Thank you for applying. Our registrar will review your application and contact you shortly via the provided phone number.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 md:px-0">
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight italic">Admission Portal</h1>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium">Begin your academic journey with us today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 pb-20">
                    {/* Student Info */}
                    <SectionCard icon={User} title="Student Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="First Name *" required value={formData.firstName} onChange={(v: string) => setFormData({ ...formData, firstName: v })} placeholder="John" />
                            <InputField label="Surname *" required value={formData.lastName} onChange={(v: string) => setFormData({ ...formData, lastName: v })} placeholder="Doe" />
                            <SelectField label="Gender *" value={formData.gender} onChange={(v: string) => setFormData({ ...formData, gender: v })}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </SelectField>
                            <InputField label="Date of Birth *" type="date" required value={formData.dateOfBirth} onChange={(v: string) => setFormData({ ...formData, dateOfBirth: v })} />
                        </div>
                        <UploadButton label="Passport Photo" uploaded={!!formData.passportPhoto} onClick={() => handleFileUpload('passportPhoto')} />
                    </SectionCard>

                    {/* Admission Details */}
                    <SectionCard icon={School} title="Admission Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="Academic Session *" value={formData.academicSessionId} onChange={(v: string) => setFormData({ ...formData, academicSessionId: v })}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </SelectField>
                            <SelectField label="Class Applying For *" value={formData.desiredClassId} onChange={(v: string) => setFormData({ ...formData, desiredClassId: v })}>
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </SelectField>
                        </div>
                    </SectionCard>

                    {/* Parent Info */}
                    <SectionCard icon={ShieldCheck} title="Parent / Guardian Info">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Guardian Name *" required value={formData.guardianName} onChange={(v: string) => setFormData({ ...formData, guardianName: v })} />
                            <InputField label="Relationship *" required value={formData.guardianRelation} onChange={(v: string) => setFormData({ ...formData, guardianRelation: v })} placeholder="Father/Mother" />
                            <InputField label="Phone Number *" required value={formData.guardianPhone} onChange={(v: string) => setFormData({ ...formData, guardianPhone: v })} />
                            <InputField label="Email Address" type="email" value={formData.guardianEmail} onChange={(v: string) => setFormData({ ...formData, guardianEmail: v })} />
                        </div>
                    </SectionCard>

                    {/* Payment Section */}
                    <section className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                                <CreditCard size={24} />
                            </div>
                            <h2 className="text-3xl font-black italic">Admission Fee Payment</h2>
                        </div>

                        <div className="p-8 bg-white/50 rounded-3xl border border-primary/10 space-y-6">
                            <p className="font-bold text-center text-primary italic uppercase tracking-widest">Bank Transfer Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <BankDetail icon={Building2} label="Bank" value="ZENITH BANK" />
                                <BankDetail icon={Hash} label="Account" value="1234567890" />
                                <BankDetail icon={User} label="Name" value="BASAER ACADEMY" />
                            </div>
                            <p className="text-center text-sm text-muted-foreground font-medium italic">Please pay the admission fee and upload the receipt below.</p>
                        </div>

                        <div className="flex justify-center">
                            <UploadButton
                                label="Upload Payment Receipt *"
                                uploaded={!!formData.paymentReceiptUrl}
                                onClick={() => handleFileUpload('paymentReceiptUrl')}
                                large
                            />
                        </div>
                    </section>

                    {/* Consent */}
                    <section className="p-8 lg:p-12 bg-card rounded-[3rem] border border-border">
                        <label className="flex gap-4 p-8 bg-primary/5 rounded-3xl cursor-pointer group">
                            <input type="checkbox" className="w-6 h-6 rounded-lg text-primary mt-1" checked={formData.guardianConsent} onChange={e => setFormData({ ...formData, guardianConsent: e.target.checked })} />
                            <div className="space-y-1">
                                <p className="font-black italic">Consent & Declaration</p>
                                <p className="text-sm text-muted-foreground font-medium">I certify that all information provided is accurate and I agree to the school's terms of admission.</p>
                            </div>
                        </label>
                    </section>

                    <div className="flex justify-center pt-8">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto px-20 py-8 bg-primary text-white rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={32} className="animate-spin" /> : <Save size={32} />}
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                .input-premium {
                    width: 100%;
                    padding: 1.25rem 1.5rem;
                    background: white;
                    border: 2px solid transparent;
                    border-radius: 1.5rem;
                    outline: none;
                    font-weight: 700;
                    font-size: 1.125rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                }
                .input-premium:focus {
                    border-color: rgba(var(--primary), 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
            `}</style>
        </div>
    );
}

function SectionCard({ icon: Icon, title, children }: any) {
    return (
        <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
            <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon size={24} />
                </div>
                <h2 className="text-3xl font-black italic">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InputField({ label, ...props }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{label}</label>
            <input className="input-premium" {...props} onChange={e => props.onChange(e.target.value)} />
        </div>
    );
}

function SelectField({ label, children, ...props }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{label}</label>
            <select className="input-premium appearance-none" {...props} onChange={e => props.onChange(e.target.value)}>
                {children}
            </select>
        </div>
    );
}

function UploadButton({ label, uploaded, onClick, large }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{label}</label>
            <div className="flex items-center gap-4">
                <button type="button" onClick={onClick} className={`bg-muted rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-muted/80 transition-all ${large ? 'px-12 py-6 text-xl' : 'px-6 py-3 text-sm'}`}>
                    <Upload size={large ? 24 : 16} /> {uploaded ? "Change File" : "Upload File"}
                </button>
                {uploaded && <span className="text-green-500 font-extrabold text-xs flex items-center gap-1"><CheckCircle2 size={16} /> READY</span>}
            </div>
        </div>
    );
}

function BankDetail({ icon: Icon, label, value }: any) {
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-primary/5">
            <Icon className="text-primary/50 mb-2" size={20} />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
            <span className="text-lg font-black italic">{value}</span>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { ClassService, Class, Section } from "@/services/classService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import { StudentService, StudentCategory } from "@/services/studentService";
import {
    UserPlus,
    Loader2,
    User,
    School,
    ShieldCheck,
    CheckCircle2,
    MapPin,
    FileText,
    Upload,
    Save
} from "lucide-react";
import { toast } from "sonner";

export default function AdmissionPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<any>({
        // Basic Info
        firstName: "",
        lastName: "",
        gender: "MALE",
        dateOfBirth: "",
        passportPhoto: "",

        // Admission Details
        academicSessionId: "",
        admissionTerm: "FIRST",
        desiredClassId: "",
        desiredSectionId: "",
        admissionType: "NEW",

        // Parent Info
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianAddress: "",

        // Contact / Medical
        address: "",
        bloodGroup: "",
        genotype: "",
        medicalConditions: "",

        // Logistics
        hostelRequired: false,
        transportRequired: false,

        // Documents
        birthCertificateUrl: "",
        testimonialUrl: "",

        // Consent
        guardianConsent: false,
        branchId: "",
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [classAttribute, sessionAttribute] = await Promise.all([
                    ClassService.getAll(),
                    SessionService.getAll()
                ]);
                setClasses(classAttribute);
                setSessions(sessionAttribute);
                if (sessionAttribute.length > 0) {
                    setFormData((prev: any) => ({ ...prev, academicSessionId: sessionAttribute.find(s => s.isActive)?.id || sessionAttribute[0].id }));
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleClassChange = (classId: string) => {
        const selectedClass = classes.find(c => c.id === classId);
        setFormData({ ...formData, desiredClassId: classId, desiredSectionId: "" });
        setSections(selectedClass?.sections || []);
    };

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
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center space-y-10 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-green-500/10 text-green-500 shadow-2xl shadow-green-500/20">
                    <CheckCircle2 size={80} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-6xl font-black tracking-tight italic">Success!</h2>
                    <p className="text-2xl text-muted-foreground font-medium">Your admission application has been received.</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                    New Application
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 md:px-0">
            <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tight italic leading-tight">Student Admission</h1>
                <p className="text-muted-foreground text-xl font-medium">Simplified Enrollment & Data Harmonization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* 1. Student Info */}
                <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <h2 className="text-3xl font-black italic">Student Basic Info</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name *</label>
                            <input required className="input-premium" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Surname *</label>
                            <input required className="input-premium" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gender *</label>
                            <select required className="input-premium appearance-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date of Birth *</label>
                            <input required type="date" className="input-premium" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Passport Photo</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => handleFileUpload('passportPhoto')} className="px-6 py-3 bg-muted rounded-xl font-bold flex items-center gap-2 hover:bg-muted/80">
                                <Upload size={16} /> Upload Photo
                            </button>
                            {formData.passportPhoto && <span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckCircle2 size={12} /> OK</span>}
                        </div>
                    </div>
                </section>

                {/* 2. Admission Details */}
                <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <School size={24} />
                        </div>
                        <h2 className="text-3xl font-black italic">Admission Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Academic Session *</label>
                            <select required className="input-premium appearance-none" value={formData.academicSessionId} onChange={e => setFormData({ ...formData, academicSessionId: e.target.value })}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admission Term *</label>
                            <select required className="input-premium appearance-none" value={formData.admissionTerm} onChange={e => setFormData({ ...formData, admissionTerm: e.target.value })}>
                                <option value="FIRST">1st Term</option>
                                <option value="SECOND">2nd Term</option>
                                <option value="THIRD">3rd Term</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Class Applying For *</label>
                            <select required className="input-premium appearance-none" value={formData.desiredClassId} onChange={e => handleClassChange(e.target.value)}>
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admission Type</label>
                            <select className="input-premium appearance-none" value={formData.admissionType} onChange={e => setFormData({ ...formData, admissionType: e.target.value })}>
                                <option value="NEW">New Student</option>
                                <option value="TRANSFER">Transfer Student</option>
                                <option value="RETURNING">Returning Student</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 3. Parent / Guardian */}
                <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-3xl font-black italic">Parent / Guardian Info</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Primary Guardian Name *</label>
                            <input required className="input-premium" value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} placeholder="Full Name" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Relationship *</label>
                            <input required className="input-premium" value={formData.guardianRelation} onChange={e => setFormData({ ...formData, guardianRelation: e.target.value })} placeholder="Father/Mother" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phone Number *</label>
                            <input required className="input-premium" value={formData.guardianPhone} onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })} placeholder="+234..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                            <input type="email" className="input-premium" value={formData.guardianEmail} onChange={e => setFormData({ ...formData, guardianEmail: e.target.value })} placeholder="guardian@example.com" />
                        </div>
                    </div>
                </section>

                {/* 4. Contact & Medical */}
                <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <h2 className="text-3xl font-black italic">Contact & Medical</h2>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Home Address *</label>
                        <textarea required className="input-premium min-h-[100px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street address..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Blood Group</label>
                            <select className="input-premium appearance-none" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
                                <option value="">Select...</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Genotype</label>
                            <select className="input-premium appearance-none" value={formData.genotype} onChange={e => setFormData({ ...formData, genotype: e.target.value })}>
                                <option value="">Select...</option>
                                <option value="AA">AA</option><option value="AS">AS</option>
                                <option value="SS">SS</option><option value="AC">AC</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 5. Documents & Consent */}
                <section className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-3xl font-black italic">Documents & Consent</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { id: 'birthCertificateUrl', name: 'Birth Certificate' },
                            { id: 'testimonialUrl', name: 'School Testimonial' },
                        ].map(doc => (
                            <div key={doc.id} className="p-8 bg-muted/20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-4 text-center group hover:border-primary/50 transition-colors">
                                <FileText size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                <h4 className="font-black text-sm">{doc.name}</h4>
                                <button type="button" onClick={() => handleFileUpload(doc.id)} className="w-full py-3 bg-muted rounded-xl font-black text-xs hover:bg-muted/80 transition-all">
                                    {formData[doc.id] ? "Change File" : "Choose File"}
                                </button>
                                {formData[doc.id] && <span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckCircle2 size={12} /> Ready</span>}
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-border/50">
                        <label className="flex gap-4 p-8 bg-primary/5 rounded-3xl cursor-pointer group hover:bg-primary/10 transition-all">
                            <input type="checkbox" className="w-6 h-6 rounded-lg text-primary mt-1" checked={formData.guardianConsent} onChange={e => setFormData({ ...formData, guardianConsent: e.target.checked })} />
                            <div className="space-y-1">
                                <p className="font-black italic">Guardian Declaration</p>
                                <p className="text-sm text-muted-foreground font-medium">I certify that the information provided is true and I agree to the school's rules and policies.</p>
                            </div>
                        </label>
                    </div>
                </section>

                <div className="flex justify-center pt-8">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-24 py-8 bg-primary text-white rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={32} className="animate-spin" /> : <Save size={32} />}
                        Submit Application
                    </button>
                </div>
            </form>

            <style jsx global>{`
                .input-premium {
                    width: 100%;
                    padding: 1.25rem 1.5rem;
                    background: rgba(var(--muted), 0.3);
                    border: 2px solid transparent;
                    border-radius: 1.5rem;
                    outline: none;
                    font-weight: 700;
                    font-size: 1.125rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    color: inherit;
                }
                .input-premium:focus {
                    background: transparent;
                    border-color: rgba(var(--primary), 0.3);
                    box-shadow: 0 0 0 4px rgba(var(--primary), 0.1);
                    transform: translateY(-2px);
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

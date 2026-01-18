"use client";

import { useState, useEffect } from "react";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
import { ClassService, Class, Section } from "@/services/classService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import { StudentService, StudentCategory } from "@/services/studentService";
import {
    UserPlus,
    Loader2,
    ChevronRight,
    ChevronLeft,
    User,
    Mail,
    Phone,
    Calendar,
    School,
    Layers,
    ShieldCheck,
    CheckCircle2,
    MapPin,
    HeartPulse,
    Home,
    Truck,
    FileText,
    Upload,
    Info,
    ShieldAlert,
    Save
} from "lucide-react";
import { clsx } from "clsx";

const STEPS = [
    { id: 1, title: "Basic Info", icon: User },
    { id: 2, title: "Admission", icon: School },
    { id: 3, title: "Parent", icon: ShieldCheck },
    { id: 4, title: "Contact", icon: MapPin },
    { id: 5, title: "Medical", icon: HeartPulse },
    { id: 6, title: "Logistics", icon: Truck },
    { id: 7, title: "Documents", icon: FileText },
    { id: 8, title: "Advanced", icon: Info },
    { id: 9, title: "Consent", icon: ShieldAlert },
    { id: 10, title: "Review", icon: CheckCircle2 },
];

export default function AdmissionPage() {
    const [step, setStep] = useState(1);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [categories, setCategories] = useState<StudentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<any>({
        // 1. Basic Info
        firstName: "",
        lastName: "",
        otherNames: "",
        gender: "MALE",
        dateOfBirth: "",
        placeOfBirth: "",
        nationality: "Nigerian",
        stateOfOrigin: "",
        lga: "",
        religion: "",
        passportPhoto: "",

        // 2. Admission Details
        academicSessionId: "",
        admissionTerm: "FIRST",
        desiredClassId: "",
        desiredSectionId: "",
        admissionType: "NEW",
        previousSchool: "",
        transferReason: "",
        assessmentScore: 0,

        // 3. Parent Info
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianAddress: "",
        guardianOccupation: "",
        guardianOfficeAddress: "",
        secondaryGuardianName: "",
        secondaryGuardianPhone: "",
        secondaryGuardianRelation: "",

        // 4. Contact
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",

        // 5. Medical
        bloodGroup: "",
        genotype: "",
        allergies: "",
        medicalConditions: "",
        specialNeeds: "",
        familyDoctorName: "",
        familyDoctorPhone: "",

        // 6. Logistics
        hostelRequired: false,
        preferredHostel: "",
        hostelNotes: "",
        transportRequired: false,
        pickupLocation: "",
        preferredRoute: "",

        // 7. Documents
        birthCertificateUrl: "",
        testimonialUrl: "",
        transferCertificateUrl: "",
        immunizationCardUrl: "",

        // 8. Advanced
        studentEmail: "",
        portalUsername: "",
        preferredLanguage: "English",
        religionClassType: "",
        scholarshipEligible: false,
        referralSource: "",

        // 9. Consent
        guardianConsent: false,
        dataProcessingConsent: false,
        schoolRulesAgreement: false,
        signature: "",
        consentDate: new Date().toISOString().split('T')[0],

        // Branch
        branchId: "", // Will be set by backend or auth context
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
        // Mock file upload
        const mockUrl = `https://storage.bmsms.edu/uploads/${field}_${Date.now()}.jpg`;
        setFormData({ ...formData, [field]: mockUrl });
        alert(`${field} uploaded successfully (Mock Mode)`);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await OnlineAdmissionService.create(formData);
            setSuccess(true);
        } catch (error) {
            console.error("Admission submission failed:", error);
            alert("Failed to submit admission application. Please check the form and try again.");
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
                    <p className="text-2xl text-muted-foreground font-medium">Your admission application has been received and is currently under review by the registrar.</p>
                </div>
                <div className="flex gap-6 justify-center pt-8">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                    >
                        New Application
                    </button>
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name *</label>
                                <input required className="input-premium" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Surname *</label>
                                <input required className="input-premium" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Other Name(s)</label>
                                <input className="input-premium" value={formData.otherNames} onChange={e => setFormData({ ...formData, otherNames: e.target.value })} placeholder="Quincy" />
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
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Passport Photo</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleFileUpload('passportPhoto')} className="px-6 py-3 bg-muted rounded-xl font-bold flex items-center gap-2 hover:bg-muted/80">
                                        <Upload size={16} /> Upload
                                    </button>
                                    {formData.passportPhoto && <span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckCircle2 size={12} /> OK</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            {formData.admissionType === "TRANSFER" && (
                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Previous School</label>
                                    <input className="input-premium" value={formData.previousSchool} onChange={e => setFormData({ ...formData, previousSchool: e.target.value })} placeholder="Name of School" />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Primary Guardian Name *</label>
                                <input required className="input-premium" value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} placeholder="Full Name" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Relationship *</label>
                                <input required className="input-premium" value={formData.guardianRelation} onChange={e => setFormData({ ...formData, guardianRelation: e.target.value })} placeholder="Father/Mother/Uncle" />
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
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Home Address *</label>
                                <textarea required className="input-premium min-h-[100px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street address, apartment, etc." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">City</label>
                                    <input className="input-premium" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">State</label>
                                    <input className="input-premium" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Country</label>
                                    <input className="input-premium" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Blood Group</label>
                                <select className="input-premium appearance-none" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
                                    <option value="">Unknown</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Genotype</label>
                                <select className="input-premium appearance-none" value={formData.genotype} onChange={e => setFormData({ ...formData, genotype: e.target.value })}>
                                    <option value="">Unknown</option>
                                    <option value="AA">AA</option>
                                    <option value="AS">AS</option>
                                    <option value="SS">SS</option>
                                    <option value="AC">AC</option>
                                </select>
                            </div>
                            <div className="col-span-full space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Known Allergies / Medical Conditions</label>
                                <textarea className="input-premium min-h-[100px]" value={formData.medicalConditions} onChange={e => setFormData({ ...formData, medicalConditions: e.target.value })} placeholder="List any medications or conditions..." />
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-10 bg-muted/20 rounded-[2.5rem] border border-border space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black italic">Hostel Accommodation</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Require boarding services?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.hostelRequired} onChange={e => setFormData({ ...formData, hostelRequired: e.target.checked })} />
                                    <div className="w-14 h-8 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-primary after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                                </label>
                            </div>
                            {formData.hostelRequired && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preferred Hostel</label>
                                        <input className="input-premium" value={formData.preferredHostel} onChange={e => setFormData({ ...formData, preferredHostel: e.target.value })} placeholder="Hostel Name" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Special Accommodation Notes</label>
                                        <input className="input-premium" value={formData.hostelNotes} onChange={e => setFormData({ ...formData, hostelNotes: e.target.value })} placeholder="E.g. Lower bunk required" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-muted/20 rounded-[2.5rem] border border-border space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black italic">Transport Service</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Require daily pickup and drop-off?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.transportRequired} onChange={e => setFormData({ ...formData, transportRequired: e.target.checked })} />
                                    <div className="w-14 h-8 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-primary after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                                </label>
                            </div>
                            {formData.transportRequired && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pickup Location</label>
                                        <input className="input-premium" value={formData.pickupLocation} onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })} placeholder="Major Landmark" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preferred Route</label>
                                        <input className="input-premium" value={formData.preferredRoute} onChange={e => setFormData({ ...formData, preferredRoute: e.target.value })} placeholder="Name of Route" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: 'birthCertificateUrl', name: 'Birth Certificate' },
                                { id: 'testimonialUrl', name: 'School Testimonial' },
                                { id: 'transferCertificateUrl', name: 'Transfer Certificate' },
                                { id: 'immunizationCardUrl', name: 'Immunization Card' },
                            ].map(doc => (
                                <div key={doc.id} className="p-8 bg-muted/20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-4 text-center group hover:border-primary/50 transition-colors">
                                    <FileText size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div>
                                        <h4 className="font-black text-sm">{doc.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">PDF or JPEG (max 5MB)</p>
                                    </div>
                                    <button onClick={() => handleFileUpload(doc.id)} className="w-full py-3 bg-muted rounded-xl font-black text-xs hover:bg-muted/80 transition-all">
                                        {formData[doc.id] ? "Change File" : "Choose File"}
                                    </button>
                                    {formData[doc.id] && <span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckCircle2 size={12} /> File Ready</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Student Personal Email</label>
                                <input type="email" className="input-premium" value={formData.studentEmail} onChange={e => setFormData({ ...formData, studentEmail: e.target.value })} placeholder="Optional personal account" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Desired Portal Username</label>
                                <input className="input-premium" value={formData.portalUsername} onChange={e => setFormData({ ...formData, portalUsername: e.target.value })} placeholder="e.g. jdoe2025" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Referral Source</label>
                                <input className="input-premium" value={formData.referralSource} onChange={e => setFormData({ ...formData, referralSource: e.target.value })} placeholder="Friend, Social Media, Advertisement" />
                            </div>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            {[
                                { id: 'guardianConsent', title: 'Guardian Declaration', desc: 'I certify that the information provided is true to the best of my knowledge.' },
                                { id: 'dataProcessingConsent', title: 'Data Processing Consent', desc: 'I agree to the schools data processing policies in compliance with NDPR.' },
                                { id: 'schoolRulesAgreement', title: 'Rules & Policies', desc: 'I agree to abide by all school rules, regulations and academic policies.' },
                            ].map(item => (
                                <div key={item.id} className="flex gap-6 p-10 bg-muted/20 rounded-[2.5rem] border border-border group hover:border-primary/30 transition-all">
                                    <input type="checkbox" className="w-8 h-8 rounded-xl border-2 border-border text-primary focus:ring-primary ring-offset-4 cursor-pointer mt-1" checked={formData[item.id]} onChange={e => setFormData({ ...formData, [item.id]: e.target.checked })} />
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black italic">{item.title}</h4>
                                        <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 max-w-md">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Guardian Signature (Full Name) *</label>
                            <input required className="input-premium text-2xl font-serif italic" value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} placeholder="Sign by typing name" />
                        </div>
                    </div>
                );
            case 10:
                const sessionName = sessions.find(s => s.id === formData.academicSessionId)?.name;
                const className = classes.find(c => c.id === formData.desiredClassId)?.name;
                return (
                    <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary border-b-2 border-primary/20 pb-2">Student Profile</h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-2xl">{formData.firstName} {formData.lastName}</p>
                                    <p className="text-muted-foreground font-medium italic">{formData.gender} • DOB: {formData.dateOfBirth}</p>
                                    <p className="text-muted-foreground font-bold">Class: {className || 'Not Selected'}</p>
                                    <p className="text-muted-foreground font-bold">Session: {sessionName || 'Not Selected'}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary border-b-2 border-primary/20 pb-2">Primary Guardian</h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-xl">{formData.guardianName}</p>
                                    <p className="text-muted-foreground font-medium">{formData.guardianPhone}</p>
                                    <p className="text-muted-foreground font-medium italic">{formData.guardianEmail}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-yellow-500/5 rounded-[3rem] border-2 border-yellow-500/20 flex gap-6 items-center">
                            <ShieldAlert size={40} className="text-yellow-500 shrink-0" />
                            <p className="text-yellow-600/80 font-bold italic">By submitting, you are creating a formal record in the BMSMS repository. Please ensure all uploaded documents are legible.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 md:px-0">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 text-primary rounded-full font-black text-xs uppercase tracking-widest mb-2">
                        <UserPlus size={14} /> Official Enrollment Portal
                    </div>
                    <h1 className="text-6xl font-black tracking-tight italic leading-tight">Student Admission</h1>
                    <p className="text-muted-foreground text-xl font-medium max-w-xl">Precision Academic Enrollment & Data Harmonization for Modern Schools.</p>
                </div>
                <div className="hidden lg:flex items-center gap-1 relative overflow-hidden p-6 bg-card border border-border rounded-[2.5rem] shadow-2xl">
                    <div className="flex items-center gap-4 px-8 text-center">
                        <p className="text-4xl font-black text-primary">10</p>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground text-left leading-tight">Sections to<br />Complete</p>
                    </div>
                </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex items-center min-w-max gap-4">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-4">
                            <button
                                onClick={() => setStep(s.id)}
                                className={clsx(
                                    "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2",
                                    step === s.id ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" :
                                        step > s.id ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-card text-muted-foreground border-border"
                                )}
                            >
                                <s.icon size={16} />
                                {s.title}
                            </button>
                            {i < STEPS.length - 1 && <ChevronRight className="text-muted-foreground/30 shrink-0" size={14} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Form Area */}
            <div className="bg-card border border-border rounded-[4rem] p-10 lg:p-20 shadow-2xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                        style={{ width: `${(step / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl rotate-3">
                            {step.toString().padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight">{STEPS[step - 1].title}</h2>
                            <p className="text-muted-foreground font-bold italic tracking-wide">Section {step} of 10</p>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {renderStep()}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-border/50 pt-12 gap-8">
                        <button
                            disabled={step === 1}
                            onClick={prevStep}
                            className="w-full md:w-auto px-10 py-5 rounded-[2rem] font-black text-lg border-2 border-border hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
                        </button>

                        {step < STEPS.length ? (
                            <button
                                onClick={nextStep}
                                className="w-full md:w-auto px-16 py-6 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                            >
                                Next Step <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full md:w-auto px-20 py-7 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={32} className="animate-spin" /> : <Save size={32} />}
                                Submit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Styles for input-premium */}
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

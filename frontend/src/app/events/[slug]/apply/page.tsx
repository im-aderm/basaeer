'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { EventsService, CampusEvent } from '@/services/eventsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    Check,
    FileText,
    Download,
    Loader2,
    Lock,
    DollarSign,
    Sparkles,
    ShieldAlert
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'basaer_event_app_draft';

export default function EventApplicationForm() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [event, setEvent] = useState<CampusEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState<string | null>(null);

    // Form inputs
    const [form, setForm] = useState({
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        state: '',
        localGovernment: '',
        memorizationLevel: '',
        school: '',
        islamicBackground: '',
        previousParticipation: '',
        medicalConditions: '',
        allergies: '',
        emergencyContact: '',
        accommodationPreference: 'BOARDING',
        packageId: '',
        passportPhotoUrl: '',
        birthCertificateUrl: '',
        ninUrl: '',
        schoolIdUrl: '',
        medicalReportUrl: '',
        proofOfPaymentUrl: '',
    });

    // Load Event details & LocalStorage Draft on mount
    useEffect(() => {
        const loadData = async () => {
            if (!slug) return;
            try {
                const data = await EventsService.getPublicEventBySlug(slug);
                setEvent(data);
                
                // Preselect first package
                if (data.packages && data.packages.length > 0) {
                    setForm(f => ({ ...f, packageId: data.packages![0].id! }));
                }

                // Check localStorage draft
                const draft = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${slug}`);
                if (draft) {
                    try {
                        const parsed = JSON.parse(draft);
                        setForm(f => ({ ...f, ...parsed }));
                    } catch (e) {
                        // Ignore parse error
                    }
                }
            } catch (error) {
                // error handled
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    // Autosave: save draft to localStorage whenever form inputs change
    useEffect(() => {
        if (event && !loading) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_${slug}`, JSON.stringify(form));
        }
    }, [form, event, loading, slug]);

    // Drag-and-Drop and File upload handler
    const handleFileUpload = async (file: File, field: string) => {
        if (!file) return;

        setUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Rate-limited, security-hardened upload route
            const res = await api.post('/upload/admission-document?category=events', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.url;
            setForm(f => ({ ...f, [field]: url }));
        } catch (error) {
            alert('File upload failed. Ensure file size is under 5MB and format is correct (JPEG/PNG/PDF).');
        } finally {
            setUploading(null);
        }
    };

    const handleFileDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file, field);
    };

    // Form validation check per step
    const isStepValid = () => {
        if (step === 1) {
            return form.fullName && form.dateOfBirth && form.gender;
        }
        if (step === 2) {
            return true; // Optional fields mostly
        }
        if (step === 3) {
            return form.emergencyContact;
        }
        if (step === 4) {
            return form.packageId;
        }
        if (step === 5) {
            // proofOfPayment is required only if fee is > 0 and paymentRequired is true
            const selectedPkg = event?.packages?.find(p => p.id === form.packageId);
            const fee = selectedPkg ? Number(selectedPkg.fee) : 0;
            if (event?.paymentRequired && fee > 0) {
                return form.proofOfPaymentUrl !== '';
            }
            return true;
        }
        return true;
    };

    // Final Submission
    const handleSubmit = async () => {
        if (!isStepValid()) {
            alert('Please fill out all required fields.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                passportPhotoUrl: form.passportPhotoUrl || undefined,
                birthCertificateUrl: form.birthCertificateUrl || undefined,
                ninUrl: form.ninUrl || undefined,
                schoolIdUrl: form.schoolIdUrl || undefined,
                medicalReportUrl: form.medicalReportUrl || undefined,
                proofOfPaymentUrl: form.proofOfPaymentUrl || undefined,
            };
            await EventsService.submitApplication(slug, payload);
            
            // Clean localStorage draft on success
            localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${slug}`);
            
            alert('Application submitted successfully! Our Registrar will audit your documents and verify payment shortly.');
            router.push(`/events/${slug}`);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit application. Please check your inputs.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-2.5 font-bold text-sm text-text-secondary">Loading registration forms...</span>
            </div>
        );
    }

    if (!event || !event.active || !event.applicationFormEnabled) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-8 space-y-4">
                <ShieldAlert className="h-16 w-16 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold font-heading">Registrations Closed</h1>
                <p className="text-text-secondary max-w-md">Online applications for this program are currently closed or have reached capacity.</p>
                <Link href={`/events/${slug}`}><Button>Return to Event Details</Button></Link>
            </div>
        );
    }

    const selectedPkg = event.packages?.find(p => p.id === form.packageId);
    const fee = selectedPkg ? Number(selectedPkg.fee) : 0;

    return (
        <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
            <GradientBackground />
            <Navbar />

            <main className="pt-32 pb-24 max-w-3xl mx-auto px-6 space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <div>
                        <h1 className="text-xl font-bold font-heading text-text-primary">Apply: {event.title}</h1>
                        <p className="text-xs text-text-secondary font-semibold mt-0.5">Fill out registration profile details. Draft auto-saved locally.</p>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary bg-surface-container-high px-3 py-1 rounded-full uppercase tracking-wider">Step {step} of 6</span>
                </div>

                {/* Steps Navigator */}
                <div className="flex bg-surface-container/30 backdrop-blur-sm p-1 rounded-full border border-border/50 justify-between text-[9px] font-bold md:text-[10px]">
                    <button onClick={() => step > 1 && setStep(1)} className={`flex-1 py-2 rounded-full transition text-center ${step === 1 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled={step < 1}>1. Personal</button>
                    <button onClick={() => step > 2 && setStep(2)} className={`flex-1 py-2 rounded-full transition text-center ${step === 2 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled={step < 2}>2. Education</button>
                    <button onClick={() => step > 3 && setStep(3)} className={`flex-1 py-2 rounded-full transition text-center ${step === 3 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled={step < 3}>3. Medical</button>
                    <button onClick={() => step > 4 && setStep(4)} className={`flex-1 py-2 rounded-full transition text-center ${step === 4 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled={step < 4}>4. Pricing</button>
                    <button onClick={() => step > 5 && setStep(5)} className={`flex-1 py-2 rounded-full transition text-center ${step === 5 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled={step < 5}>5. Uploads</button>
                    <button className={`flex-1 py-2 rounded-full transition text-center ${step === 6 ? 'bg-primary text-white' : 'text-text-secondary'}`} disabled>6. Review</button>
                </div>

                {/* Step 1: Personal Profile */}
                {step === 1 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Personal Profile & Contact</CardTitle>
                            <CardDescription>Enter details matching official birth records or passport papers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName" className="font-bold text-xs uppercase opacity-75">Applicant Full Name *</Label>
                                <Input id="fullName" placeholder="First Name Middle Name Surname" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="gender" className="font-bold text-xs uppercase opacity-75">Gender *</Label>
                                    <select id="gender" className="h-11 w-full px-3 text-xs font-bold rounded-xl bg-background/50 border border-border/50 outline-none text-text-primary cursor-pointer" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dob" className="font-bold text-xs uppercase opacity-75">Date of Birth *</Label>
                                    <Input id="dob" type="date" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-3 border-t border-border/40">
                                <Label htmlFor="parentName" className="font-bold text-xs uppercase opacity-75">Parent / Guardian Full Name</Label>
                                <Input id="parentName" placeholder="e.g. Malam Musa Ibrahim" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="parentPhone" className="font-bold text-xs uppercase opacity-75">Parent Phone Number</Label>
                                    <Input id="parentPhone" placeholder="080XXXXXXXX" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.parentPhone} onChange={e => setForm({...form, parentPhone: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="parentEmail" className="font-bold text-xs uppercase opacity-75">Parent Email Address</Label>
                                    <Input id="parentEmail" placeholder="parent@domain.com" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.parentEmail} onChange={e => setForm({...form, parentEmail: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-3 border-t border-border/40">
                                <Label htmlFor="address" className="font-bold text-xs uppercase opacity-75">Residential Address</Label>
                                <Input id="address" placeholder="e.g. Flat 12, Aminu Kano Crescent, Wuse II" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="state" className="font-bold text-xs uppercase opacity-75">State of Residence</Label>
                                    <Input id="state" placeholder="e.g. FCT / Kaduna" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lga" className="font-bold text-xs uppercase opacity-75">Local Government Area</Label>
                                    <Input id="lga" placeholder="e.g. Abuja Municipal / Kaduna South" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.localGovernment} onChange={e => setForm({...form, localGovernment: e.target.value})} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Educational background */}
                {step === 2 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Educational & Religious Background</CardTitle>
                            <CardDescription>Detail applicant's school profile, Islamic study and Hifdh memorization level.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="school" className="font-bold text-xs uppercase opacity-75">Current School</Label>
                                <Input id="school" placeholder="e.g. Basaeer Science College" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.school} onChange={e => setForm({...form, school: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="hifz" className="font-bold text-xs uppercase opacity-75">Current Quran Memorization Level (Hifdh)</Label>
                                <Input id="hifz" placeholder="e.g. 5 Juz, 15 Juz, or Whole Quran" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.memorizationLevel} onChange={e => setForm({...form, memorizationLevel: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="islamicBackground" className="font-bold text-xs uppercase opacity-75">Islamic Studies Background / Madrasah Details</Label>
                                <textarea id="islamicBackground" rows={3} placeholder="Outline previous Islamic/Tajweed studies, evening school attendances..." className="w-full p-3 font-semibold text-sm rounded-xl border border-border/50 bg-background/50 outline-none resize-none" value={form.islamicBackground} onChange={e => setForm({...form, islamicBackground: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="prevPart" className="font-bold text-xs uppercase opacity-75">Previous Camp / Competition Participations</Label>
                                <Input id="prevPart" placeholder="e.g. Participated in Basaeer Camp 2024" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.previousParticipation} onChange={e => setForm({...form, previousParticipation: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Health info */}
                {step === 3 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Medical & Health Profile</CardTitle>
                            <CardDescription>Disclose health requirements to assist camp medics during housing/accommodation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="medicalConditions" className="font-bold text-xs uppercase opacity-75">Medical Conditions / Chronic Illnesses</Label>
                                <textarea id="medicalConditions" rows={3} placeholder="Please detail asthma, diabetes, physical conditions, etc. Leave blank if none." className="w-full p-3 font-semibold text-sm rounded-xl border border-border/50 bg-background/50 outline-none resize-none" value={form.medicalConditions} onChange={e => setForm({...form, medicalConditions: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="allergies" className="font-bold text-xs uppercase opacity-75">Allergies (Food, Meds, Environmental)</Label>
                                <textarea id="allergies" rows={3} placeholder="Outline drug allergies, gluten intolerance, specific medication triggers. Leave blank if none." className="w-full p-3 font-semibold text-sm rounded-xl border border-border/50 bg-background/50 outline-none resize-none" value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
                            </div>
                            <div className="space-y-1.5 pt-3 border-t border-border/40">
                                <Label htmlFor="emContact" className="font-bold text-xs uppercase opacity-75">Emergency Contact Details *</Label>
                                <Input id="emContact" placeholder="e.g. Uncle Aliyu Ibrahim: 08098765432" className="h-11 rounded-xl bg-background/50 border-border/50 font-bold" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Package selection */}
                {step === 4 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Package Selection & Payments</CardTitle>
                            <CardDescription>Select event packages and retrieve manual bank transfer instructions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="font-bold text-xs uppercase opacity-75">Choose Package *</Label>
                                <div className="space-y-3">
                                    {event.packages && event.packages.length > 0 ? (
                                        event.packages.map((pkg) => (
                                            <label key={pkg.id} className={`flex items-start justify-between p-4 border rounded-2xl cursor-pointer bg-background/40 hover:border-primary transition select-none ${form.packageId === pkg.id ? 'border-primary ring-1 ring-primary' : 'border-border/50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <input type="radio" name="package" className="h-4.5 w-4.5 accent-primary mt-1 shrink-0 cursor-pointer" checked={form.packageId === pkg.id} onChange={() => setForm({...form, packageId: pkg.id!})} />
                                                    <div>
                                                        <span className="font-bold text-sm block leading-none">{pkg.title}</span>
                                                        <span className="text-[10px] text-text-secondary mt-1 block font-semibold">{pkg.boardingType.replace('_', ' ')} • Age {pkg.ageRange}</span>
                                                        {pkg.description && <span className="text-[10px] text-muted-foreground block mt-1 leading-relaxed">{pkg.description}</span>}
                                                    </div>
                                                </div>
                                                <span className="font-extrabold text-xs text-primary font-heading shrink-0 ml-2">₦{Number(pkg.fee).toLocaleString()}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-xs text-muted-foreground">No program packages configured.</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border/40">
                                <Label htmlFor="accomPref" className="font-bold text-xs uppercase opacity-75">Boarding / Lodging Preference</Label>
                                <select id="accomPref" className="h-11 w-full px-3 text-xs font-bold rounded-xl bg-background/50 border border-border/50 outline-none text-text-primary cursor-pointer" value={form.accommodationPreference} onChange={e => setForm({...form, accommodationPreference: e.target.value})}>
                                    <option value="BOARDING">Full Campus Boarding</option>
                                    <option value="DAY_STUDENT">Day Student (Commute Daily)</option>
                                    <option value="NO_HOUSING">No Housing Needed</option>
                                </select>
                            </div>

                            {/* Bank Details for manual transfers */}
                            {fee > 0 && (
                                <div className="p-4 bg-primary/[0.03] border border-primary/20 rounded-2xl space-y-3 font-semibold text-xs text-text-secondary">
                                    <h4 className="font-bold text-sm text-primary flex items-center gap-1 leading-none uppercase">
                                        <DollarSign size={16} /> Manual Bank Transfer Instructions
                                    </h4>
                                    <p className="leading-relaxed">To complete registration, please transfer the exact package fee (₦{fee.toLocaleString()}) to the Waqf account below, and save the receipt to upload in Step 5.</p>
                                    <div className="p-3 bg-background/50 border rounded-xl space-y-1 border-primary/10">
                                        <div><span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">Bank Name</span><span className="font-bold text-text-primary">First Bank</span></div>
                                        <div className="pt-1.5 border-t border-border/30"><span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">Account Number</span><span className="font-extrabold text-sm text-primary font-mono select-all">2046905491</span></div>
                                        <div className="pt-1.5 border-t border-border/30"><span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">Account Name</span><span className="font-bold text-text-primary">Basa'er Qur'anic Memorization School - Kaduna Boarding</span></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Document Uploads */}
                {step === 5 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Upload Certificates & Slip Receipt</CardTitle>
                            <CardDescription>Drag and drop files to securely upload requirements (size limit: 5MB, format: JPG, PNG, PDF).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Passport & Birth Cert */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Passport */}
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase opacity-75">Passport Photograph *</Label>
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => handleFileDrop(e, 'passportPhotoUrl')}
                                        className="border-2 border-dashed border-border/60 hover:border-primary rounded-2xl p-4 text-center bg-background/40 flex flex-col items-center justify-center min-h-[140px] transition relative"
                                    >
                                        {form.passportPhotoUrl ? (
                                            <div className="space-y-2 w-full text-center">
                                                <img src={form.passportPhotoUrl} className="max-h-24 mx-auto rounded-lg object-cover border" alt="Passport Upload" />
                                                <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-border" onClick={() => setForm({...form, passportPhotoUrl: ''})}>Remove</Button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-primary opacity-60" />
                                                <span className="text-xs font-bold text-text-secondary">
                                                    {uploading === 'passportPhotoUrl' ? 'Uploading...' : 'Drop or Click to Upload'}
                                                </span>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'passportPhotoUrl')} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Birth Cert */}
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase opacity-75">Birth Certificate *</Label>
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => handleFileDrop(e, 'birthCertificateUrl')}
                                        className="border-2 border-dashed border-border/60 hover:border-primary rounded-2xl p-4 text-center bg-background/40 flex flex-col items-center justify-center min-h-[140px] transition relative"
                                    >
                                        {form.birthCertificateUrl ? (
                                            <div className="space-y-2 w-full text-center">
                                                <FileText className="h-10 w-10 text-primary mx-auto opacity-75" />
                                                <span className="text-xs font-bold block max-w-[200px] truncate mx-auto">Uploaded Birth Cert</span>
                                                <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-border" onClick={() => setForm({...form, birthCertificateUrl: ''})}>Remove</Button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-primary opacity-60" />
                                                <span className="text-xs font-bold text-text-secondary">
                                                    {uploading === 'birthCertificateUrl' ? 'Uploading...' : 'Drop or Click to Upload'}
                                                </span>
                                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'birthCertificateUrl')} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NIN & Payment receipt */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                                {/* NIN */}
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase opacity-75">National Identity Number (NIN) slip</Label>
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => handleFileDrop(e, 'ninUrl')}
                                        className="border-2 border-dashed border-border/60 hover:border-primary rounded-2xl p-4 text-center bg-background/40 flex flex-col items-center justify-center min-h-[140px] transition relative"
                                    >
                                        {form.ninUrl ? (
                                            <div className="space-y-2 w-full text-center">
                                                <FileText className="h-10 w-10 text-primary mx-auto opacity-75" />
                                                <span className="text-xs font-bold block max-w-[200px] truncate mx-auto">Uploaded NIN Document</span>
                                                <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-border" onClick={() => setForm({...form, ninUrl: ''})}>Remove</Button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-primary opacity-60" />
                                                <span className="text-xs font-bold text-text-secondary">
                                                    {uploading === 'ninUrl' ? 'Uploading...' : 'Drop or Click to Upload'}
                                                </span>
                                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ninUrl')} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Proof of Payment */}
                                {fee > 0 && event.paymentRequired && (
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase opacity-75">Transfer Proof of Payment Receipt *</Label>
                                        <div
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={e => handleFileDrop(e, 'proofOfPaymentUrl')}
                                            className="border-2 border-dashed border-border/60 hover:border-primary rounded-2xl p-4 text-center bg-background/40 flex flex-col items-center justify-center min-h-[140px] transition relative animate-pulse"
                                        >
                                            {form.proofOfPaymentUrl ? (
                                                <div className="space-y-2 w-full text-center">
                                                    <FileText className="h-10 w-10 text-primary mx-auto opacity-75" />
                                                    <span className="text-xs font-bold block max-w-[200px] truncate mx-auto">Uploaded Payment Receipt</span>
                                                    <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-border" onClick={() => setForm({...form, proofOfPaymentUrl: ''})}>Remove</Button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                    <Upload className="h-8 w-8 text-primary opacity-60" />
                                                    <span className="text-xs font-bold text-text-secondary">
                                                        {uploading === 'proofOfPaymentUrl' ? 'Uploading...' : 'Drop or Click to Upload'}
                                                    </span>
                                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proofOfPaymentUrl')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 6: Confirmation Review */}
                {step === 6 && (
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Review & Submit</CardTitle>
                            <CardDescription>Confirm your entries. Once submitted, registrars will review your details shortly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-xs font-semibold text-text-secondary">
                            {/* Summary tables */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 bg-background/40 p-4 rounded-2xl border border-border/50">
                                    <h3 className="font-bold text-[10px] uppercase text-primary border-b pb-1">Applicant Summary</h3>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Full Name</span><span className="font-bold text-text-primary">{form.fullName}</span></div>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Date of Birth</span><span>{form.dateOfBirth} ({form.gender})</span></div>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Emergency Contact</span><span>{form.emergencyContact}</span></div>
                                </div>
                                <div className="space-y-2 bg-background/40 p-4 rounded-2xl border border-border/50">
                                    <h3 className="font-bold text-[10px] uppercase text-primary border-b pb-1">Program & Pricing</h3>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Event</span><span className="font-bold text-text-primary">{event.title}</span></div>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Package</span><span>{selectedPkg?.title}</span></div>
                                    <div><span className="text-[9px] text-muted-foreground uppercase block">Total Due</span><span className="font-extrabold text-primary">₦{fee.toLocaleString()}</span></div>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/[0.02] border border-primary/20 rounded-2xl flex items-start gap-2.5">
                                <Lock className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-relaxed">By submitting, you agree to comply with Basaeer camp rules, behavioral regulations, and religious guidelines. Uploaded certificates will be verified during check-in audits.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Controls footer */}
                <div className="flex justify-between items-center bg-surface-container/30 backdrop-blur-sm p-4 border border-border/50 rounded-2xl shadow-md">
                    <Button variant="ghost" disabled={step === 1} className="h-10 rounded-full font-bold border border-border/60 gap-1.5" onClick={() => setStep(step - 1)}>
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <div className="flex gap-2">
                        <Link href={`/events/${slug}`}><Button variant="outline" className="h-10 rounded-full font-bold border-border text-text-secondary">Cancel</Button></Link>
                        {step < 6 ? (
                            <Button disabled={!isStepValid()} className="h-10 px-6 rounded-full font-bold gap-1.5" onClick={() => setStep(step + 1)}>
                                Next <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button disabled={saving} className="h-10 px-6 rounded-full font-bold gap-1.5 shadow-lg shadow-primary/25" onClick={handleSubmit}>
                                {saving ? 'Submitting...' : <>Submit Application <Check size={16} /></>}
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

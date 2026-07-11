'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useNotification } from '@/context/NotificationContext';
import { EventsService } from '@/services/eventsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import {
    Calendar as CalendarIcon,
    Plus,
    Minus,
    Trash2,
    Save,
    ArrowLeft,
    ArrowRight,
    Upload,
    Check,
    FileText,
    Loader2,
    Sparkles
} from 'lucide-react';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { showSuccess, showError } = useNotification();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Form states
    const [form, setForm] = useState({
        title: '',
        shortDescription: '',
        fullDescription: '',
        category: 'CAMP',
        location: '',
        capacity: '',
        startDate: '',
        endDate: '',
        applicationDeadline: '',
        isPublic: true,
        allowRSVP: false,
        status: 'ACTIVE',
        active: true,
        registrationOpen: true,
        applicationFormEnabled: true,
        paymentRequired: true,
        rulesAndDiscipline: '',
        mealsAndHospitality: '',
        featuredImage: '',
        brochurePdf: '',
        seoMetadata: { seoTitle: '', seoDescription: '', seoKeywords: '' },
    });

    const [objectives, setObjectives] = useState<string[]>(['']);
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [whyChooseThisEvent, setWhyChooseThisEvent] = useState<string[]>(['']);
    const [packages, setPackages] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const event = await EventsService.getEventDetails(id);
                
                // Helper to format ISO Date to local datetime string
                const formatDatetime = (isoStr?: string) => {
                    if (!isoStr) return '';
                    const d = new Date(isoStr);
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                setForm({
                    title: event.title,
                    shortDescription: event.shortDescription || '',
                    fullDescription: event.fullDescription || '',
                    category: event.categoryLabel,
                    location: event.location || '',
                    capacity: event.capacity ? String(event.capacity) : '',
                    startDate: formatDatetime(event.startDate),
                    endDate: formatDatetime(event.endDate),
                    applicationDeadline: formatDatetime(event.applicationDeadline),
                    isPublic: event.isPublic,
                    allowRSVP: event.allowRSVP,
                    status: event.status,
                    active: event.active,
                    registrationOpen: event.registrationOpen,
                    applicationFormEnabled: event.applicationFormEnabled,
                    paymentRequired: event.paymentRequired,
                    rulesAndDiscipline: event.rulesAndDiscipline || '',
                    mealsAndHospitality: event.mealsAndHospitality || '',
                    featuredImage: event.featuredImage || '',
                    brochurePdf: event.brochurePdf || '',
                    seoMetadata: event.seoMetadata || { seoTitle: '', seoDescription: '', seoKeywords: '' },
                });

                setObjectives(event.objectives.length > 0 ? event.objectives : ['']);
                setRequirements(event.requirements.length > 0 ? event.requirements : ['']);
                setWhyChooseThisEvent(event.whyChooseThisEvent.length > 0 ? event.whyChooseThisEvent : ['']);
                setPackages(event.packages || []);
                setSchedules(event.schedules || []);
                setGallery(event.gallery || []);
                
            } catch (error) {
                showError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadEvent();
    }, [id]);

    // Array manipulation helpers
    const handleAddField = (setter: any, array: any[]) => setter([...array, '']);
    const handleRemoveField = (setter: any, array: any[], index: number) => setter(array.filter((_, i) => i !== index));
    const handleFieldChange = (setter: any, array: any[], index: number, val: string) => {
        const copy = [...array];
        copy[index] = val;
        setter(copy);
    };

    // File Uploader
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload/admission-document?category=events', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.url;
            
            if (field === 'featuredImage' || field === 'brochurePdf') {
                setForm(f => ({ ...f, [field]: url }));
            } else if (field === 'gallery') {
                setGallery(g => [...g, { imageUrl: url, isCover: false, order: g.length, caption: '' }]);
            }
            showSuccess('File uploaded successfully');
        } catch (error) {
            showError('File upload failed. Ensure size is under 5MB and type is valid.');
        } finally {
            setUploading(null);
        }
    };

    // Submit handler
    const handleSave = async () => {
        if (!form.title) {
            showError('Event title is required');
            return;
        }
        if (!form.startDate || !form.endDate) {
            showError('Start and end dates are required');
            return;
        }

        setSaving(true);
        try {
            const cleanObjs = objectives.filter(o => o.trim() !== '');
            const cleanReqs = requirements.filter(r => r.trim() !== '');
            const cleanWhys = whyChooseThisEvent.filter(w => w.trim() !== '');

            const payload = {
                ...form,
                capacity: form.capacity ? parseInt(form.capacity) : null,
                objectives: cleanObjs,
                requirements: cleanReqs,
                whyChooseThisEvent: cleanWhys,
                featuredImage: form.featuredImage || undefined,
                brochurePdf: form.brochurePdf || undefined,
                packages: packages.map(p => ({
                    title: p.title,
                    ageRange: p.ageRange,
                    timing: p.timing,
                    fee: parseFloat(p.fee),
                    boardingType: p.boardingType,
                    availableSlots: p.availableSlots ? parseInt(p.availableSlots) : null,
                    description: p.description
                })),
                schedules: schedules.map(s => ({
                    day: s.day,
                    period: s.period,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    activity: s.activity
                })),
                gallery: gallery.map(g => ({
                    imageUrl: g.imageUrl,
                    isCover: g.isCover,
                    order: g.order,
                    caption: g.caption
                })),
            };

            await EventsService.updateEvent(id, payload);
            showSuccess('Event updated successfully');
            router.push('/dashboard/events');
        } catch (error: any) {
            showError(error?.response?.data?.message || 'Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 font-semibold text-sm">Loading event data...</span>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/events" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center gap-1">
                        <ArrowLeft size={16} /> Back to Events
                    </Link>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase tracking-wider">Step {step} of 5</span>
                </div>

                {/* Steps Navigation Bar */}
                <div className="flex bg-card p-2.5 rounded-2xl border border-primary/10 shadow-sm justify-between text-xs font-bold">
                    <button onClick={() => setStep(1)} className={`px-4 py-2 rounded-xl transition ${step === 1 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>1. General</button>
                    <button onClick={() => setStep(2)} className={`px-4 py-2 rounded-xl transition ${step === 2 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>2. Logistics</button>
                    <button onClick={() => setStep(3)} className={`px-4 py-2 rounded-xl transition ${step === 3 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>3. Details</button>
                    <button onClick={() => setStep(4)} className={`px-4 py-2 rounded-xl transition ${step === 4 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>4. Packages</button>
                    <button onClick={() => setStep(5)} className={`px-4 py-2 rounded-xl transition ${step === 5 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>5. Schedule & Gallery</button>
                </div>

                {/* Step 1: General Info */}
                {step === 1 && (
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
                            <CardDescription>Edit the title, category, location, and brief descriptions of the event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="font-semibold text-xs uppercase opacity-75">Event Title</Label>
                                <Input id="title" placeholder="e.g. Dauhatul-Qur'an Camp 2026" className="h-11 rounded-xl font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="category" className="font-semibold text-xs uppercase opacity-75">Category</Label>
                                    <select id="category" className="h-11 w-full px-3 text-sm font-semibold rounded-xl bg-background border border-primary/20 outline-none text-foreground cursor-pointer" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option value="CAMP">Camp</option>
                                        <option value="CONFERENCE">Conference</option>
                                        <option value="COMPETITION">Competition</option>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="EXCURSION">Excursion</option>
                                        <option value="SUMMER_PROGRAM">Summer Program</option>
                                        <option value="TAHFIZ_PROGRAM">Tahfiz Program</option>
                                        <option value="ACADEMIC_PROGRAM">Academic Program</option>
                                        <option value="OTHERS">Others</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="location" className="font-semibold text-xs uppercase opacity-75">Location / Venue</Label>
                                    <Input id="location" placeholder="e.g. Kaduna Headquarters Campus" className="h-11 rounded-xl font-bold" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="shortDescription" className="font-semibold text-xs uppercase opacity-75">Short Description</Label>
                                <Input id="shortDescription" placeholder="A single sentence highlighting the event..." className="h-11 rounded-xl font-bold" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="fullDescription" className="font-semibold text-xs uppercase opacity-75">Full Description</Label>
                                <textarea id="fullDescription" rows={5} placeholder="Provide a detailed description of the event..." className="w-full p-3 font-semibold text-sm rounded-xl border border-primary/20 bg-background outline-none resize-none" value={form.fullDescription} onChange={e => setForm({...form, fullDescription: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Logistics & Rules */}
                {step === 2 && (
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Dates & Permissions</CardTitle>
                            <CardDescription>Setup timestamps, capacities, and enable/disable registration permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="startDate" className="font-semibold text-xs uppercase opacity-75">Start Date</Label>
                                    <Input id="startDate" type="datetime-local" className="h-11 rounded-xl font-bold" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="endDate" className="font-semibold text-xs uppercase opacity-75">End Date</Label>
                                    <Input id="endDate" type="datetime-local" className="h-11 rounded-xl font-bold" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="deadline" className="font-semibold text-xs uppercase opacity-75">Application Deadline</Label>
                                    <Input id="deadline" type="datetime-local" className="h-11 rounded-xl font-bold" value={form.applicationDeadline} onChange={e => setForm({...form, applicationDeadline: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="capacity" className="font-semibold text-xs uppercase opacity-75">Capacity (Max Applicants)</Label>
                                    <Input id="capacity" type="number" placeholder="Leave empty for unlimited" className="h-11 rounded-xl font-bold" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-primary/10">
                                <div className="flex items-center space-x-2.5 py-2">
                                    <input id="isPublic" type="checkbox" className="h-4.5 w-4.5 accent-primary rounded cursor-pointer" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} />
                                    <Label htmlFor="isPublic" className="font-bold text-xs uppercase cursor-pointer">Public Visibility</Label>
                                </div>
                                <div className="flex items-center space-x-2.5 py-2">
                                    <input id="active" type="checkbox" className="h-4.5 w-4.5 accent-primary rounded cursor-pointer" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                                    <Label htmlFor="active" className="font-bold text-xs uppercase cursor-pointer">Is Active</Label>
                                </div>
                                <div className="flex items-center space-x-2.5 py-2">
                                    <input id="regOpen" type="checkbox" className="h-4.5 w-4.5 accent-primary rounded cursor-pointer" checked={form.registrationOpen} onChange={e => setForm({...form, registrationOpen: e.target.checked})} />
                                    <Label htmlFor="regOpen" className="font-bold text-xs uppercase cursor-pointer">Registration Open</Label>
                                </div>
                                <div className="flex items-center space-x-2.5 py-2">
                                    <input id="formEnabled" type="checkbox" className="h-4.5 w-4.5 accent-primary rounded cursor-pointer" checked={form.applicationFormEnabled} onChange={e => setForm({...form, applicationFormEnabled: e.target.checked})} />
                                    <Label htmlFor="formEnabled" className="font-bold text-xs uppercase cursor-pointer">Application Form Enabled</Label>
                                </div>
                                <div className="flex items-center space-x-2.5 py-2">
                                    <input id="payReq" type="checkbox" className="h-4.5 w-4.5 accent-primary rounded cursor-pointer" checked={form.paymentRequired} onChange={e => setForm({...form, paymentRequired: e.target.checked})} />
                                    <Label htmlFor="payReq" className="font-bold text-xs uppercase cursor-pointer">Payment Required</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Rules & Details */}
                {step === 3 && (
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Rules & Objectives</CardTitle>
                            <CardDescription>Setup specific program criteria, meals, and guidelines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Objectives */}
                            <div className="space-y-2">
                                                        <div className="flex justify-between items-center"><Label className="font-semibold text-xs uppercase opacity-75">Objectives</Label><Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg border-primary/10" onClick={() => handleAddField(setObjectives, objectives)}><Plus size={14} className="mr-1"/> Add</Button></div>
                                {objectives.map((obj, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={obj} onChange={e => handleFieldChange(setObjectives, objectives, i, e.target.value)} className="h-10 rounded-lg font-bold" placeholder="Objective..." />
                                        {objectives.length > 1 && <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-lg shrink-0 border border-primary/10" onClick={() => handleRemoveField(setObjectives, objectives, i)}><Trash2 size={16}/></Button>}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Requirements */}
                            <div className="space-y-2">
                                                        <div className="flex justify-between items-center"><Label className="font-semibold text-xs uppercase opacity-75">Requirements</Label><Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg border-primary/10" onClick={() => handleAddField(setRequirements, requirements)}><Plus size={14} className="mr-1"/> Add</Button></div>
                                {requirements.map((req, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={req} onChange={e => handleFieldChange(setRequirements, requirements, i, e.target.value)} className="h-10 rounded-lg font-bold" placeholder="Requirement..." />
                                        {requirements.length > 1 && <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-lg shrink-0 border border-primary/10" onClick={() => handleRemoveField(setRequirements, requirements, i)}><Trash2 size={16}/></Button>}
                                    </div>
                                ))}
                            </div>

                            {/* Why Choose */}
                            <div className="space-y-2">
                                                        <div className="flex justify-between items-center"><Label className="font-semibold text-xs uppercase opacity-75">Why Choose Basaeer Events?</Label><Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg border-primary/10" onClick={() => handleAddField(setWhyChooseThisEvent, whyChooseThisEvent)}><Plus size={14} className="mr-1"/> Add</Button></div>
                                {whyChooseThisEvent.map((why, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={why} onChange={e => handleFieldChange(setWhyChooseThisEvent, whyChooseThisEvent, i, e.target.value)} className="h-10 rounded-lg font-bold" placeholder="Reason..." />
                                        {whyChooseThisEvent.length > 1 && <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-lg shrink-0 border border-primary/10" onClick={() => handleRemoveField(setWhyChooseThisEvent, whyChooseThisEvent, i)}><Trash2 size={16}/></Button>}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="rules" className="font-semibold text-xs uppercase opacity-75">Rules & Discipline Guidelines</Label>
                                <textarea id="rules" rows={3} placeholder="Rules regarding mobile phones, dress codes, behavior..." className="w-full p-3 font-semibold text-sm rounded-xl border border-primary/20 bg-background outline-none resize-none" value={form.rulesAndDiscipline} onChange={e => setForm({...form, rulesAndDiscipline: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="meals" className="font-semibold text-xs uppercase opacity-75">Meals & Hospitality</Label>
                                <textarea id="meals" rows={3} placeholder="Describe boarding meals, dietary considerations..." className="w-full p-3 font-semibold text-sm rounded-xl border border-primary/20 bg-background outline-none resize-none" value={form.mealsAndHospitality} onChange={e => setForm({...form, mealsAndHospitality: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Packages & Pricing */}
                {step === 4 && (
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold">Programs & Packages</CardTitle>
                                <CardDescription>Establish boarding fees, age criteria, and timings for packages.</CardDescription>
                            </div>
                            <Button size="sm" className="h-9 px-4 rounded-xl font-bold gap-1" onClick={() => setPackages([...packages, { title: '', ageRange: '', timing: '', fee: 0, boardingType: 'DAY', availableSlots: 100, description: '' }])}>
                                <Plus size={16} /> Add Package
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {packages.map((pkg, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-primary/10 space-y-4 bg-muted/10 relative">
                                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-red-500 hover:bg-red-50 rounded" onClick={() => setPackages(packages.filter((_, i) => i !== idx))}>
                                        <Trash2 size={15} />
                                    </Button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Package Title</Label>
                                            <Input placeholder="e.g. Day Program" className="h-10 rounded-lg font-bold" value={pkg.title} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].title = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Boarding Type</Label>
                                            <select className="h-10 w-full px-3 text-sm font-semibold rounded-lg bg-background border border-primary/20 outline-none cursor-pointer" value={pkg.boardingType} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].boardingType = e.target.value;
                                                setPackages(copy);
                                            }} >
                                                <option value="DAY">Day Program</option>
                                                <option value="BOARDING">Boarding</option>
                                                <option value="FULL_BOARDING">Full Boarding</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="space-y-1.5 col-span-2">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Fee (NGN)</Label>
                                            <Input type="number" className="h-10 rounded-lg font-bold" value={pkg.fee} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].fee = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Age Range</Label>
                                            <Input placeholder="e.g. 10-18" className="h-10 rounded-lg font-bold" value={pkg.ageRange} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].ageRange = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Slots</Label>
                                            <Input type="number" className="h-10 rounded-lg font-bold" value={pkg.availableSlots} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].availableSlots = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Timing</Label>
                                            <Input placeholder="e.g. 8:00 AM - 4:00 PM" className="h-10 rounded-lg font-bold" value={pkg.timing} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].timing = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-semibold text-xs uppercase opacity-75">Brief Description</Label>
                                            <Input placeholder="Package benefits description..." className="h-10 rounded-lg font-bold" value={pkg.description} onChange={e => {
                                                const copy = [...packages];
                                                copy[idx].description = e.target.value;
                                                setPackages(copy);
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Schedules & Upload Media */}
                {step === 5 && (
                    <div className="space-y-6">
                        {/* Event Schedules */}
                        <Card className="rounded-2xl border-primary/10 shadow-sm">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg font-bold">Structured Schedule</CardTitle>
                                    <CardDescription>Add times, days, and planned activities for the event program.</CardDescription>
                                </div>
                                <Button size="sm" className="h-9 px-4 rounded-xl font-bold gap-1" onClick={() => setSchedules([...schedules, { day: 'Day 1', period: 'Morning', startTime: '', endTime: '', activity: '' }])}>
                                    <Plus size={16} /> Add Session
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {schedules.map((sch, index) => (
                                    <div key={index} className="grid grid-cols-6 gap-3 items-end p-3.5 rounded-xl border border-primary/10 bg-muted/5 relative">
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Day</Label>
                                            <Input placeholder="Day 1" className="h-9 text-xs rounded-lg font-bold" value={sch.day} onChange={e => {
                                                const copy = [...schedules];
                                                copy[index].day = e.target.value;
                                                setSchedules(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Period</Label>
                                            <Input placeholder="Morning" className="h-9 text-xs rounded-lg font-bold" value={sch.period} onChange={e => {
                                                const copy = [...schedules];
                                                copy[index].period = e.target.value;
                                                setSchedules(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start</Label>
                                            <Input type="time" className="h-9 text-xs rounded-lg font-bold" value={sch.startTime} onChange={e => {
                                                const copy = [...schedules];
                                                copy[index].startTime = e.target.value;
                                                setSchedules(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">End</Label>
                                            <Input type="time" className="h-9 text-xs rounded-lg font-bold" value={sch.endTime} onChange={e => {
                                                const copy = [...schedules];
                                                copy[index].endTime = e.target.value;
                                                setSchedules(copy);
                                            }} />
                                        </div>
                                        <div className="space-y-1 col-span-2 flex gap-2">
                                            <div className="flex-1">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Activity</Label>
                                                <Input placeholder="Class, recitation..." className="h-9 text-xs rounded-lg font-bold" value={sch.activity} onChange={e => {
                                                    const copy = [...schedules];
                                                    copy[index].activity = e.target.value;
                                                    setSchedules(copy);
                                                }} />
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:bg-red-50 border border-primary/10 rounded-lg shrink-0" onClick={() => setSchedules(schedules.filter((_, i) => i !== index))}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Media Uploads */}
                        <Card className="rounded-2xl border-primary/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Featured Assets & Gallery</CardTitle>
                                <CardDescription>Upload cover images, descriptive PDFs, and program pictures.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Featured Image */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-75">Featured Image (Banner)</Label>
                                        <div className="border-2 border-dashed border-primary/20 rounded-2xl p-4 text-center bg-muted/5 flex flex-col items-center justify-center min-h-[140px] hover:border-primary transition relative">
                                            {form.featuredImage ? (
                                                <div className="w-full space-y-2">
                                                    <img src={form.featuredImage} className="max-h-24 mx-auto rounded-lg object-cover" alt="Featured Preview" />
                                                    <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-primary/10" onClick={() => setForm({...form, featuredImage: ''})}>Remove</Button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                    <Upload className="h-8 w-8 text-primary opacity-60" />
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        {uploading === 'featuredImage' ? 'Uploading...' : 'Click to upload image'}
                                                    </span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'featuredImage')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Brochure PDF */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-75">Brochure PDF / Syllabus</Label>
                                        <div className="border-2 border-dashed border-primary/20 rounded-2xl p-4 text-center bg-muted/5 flex flex-col items-center justify-center min-h-[140px] hover:border-primary transition relative">
                                            {form.brochurePdf ? (
                                                <div className="w-full space-y-2">
                                                    <FileText className="h-10 w-10 text-primary mx-auto opacity-75" />
                                                    <span className="text-xs font-bold truncate block max-w-[200px] mx-auto">{form.brochurePdf.split('/').pop()}</span>
                                                    <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg border-primary/10" onClick={() => setForm({...form, brochurePdf: ''})}>Remove</Button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer space-y-2 flex flex-col items-center">
                                                    <Upload className="h-8 w-8 text-primary opacity-60" />
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        {uploading === 'brochurePdf' ? 'Uploading...' : 'Click to upload PDF'}
                                                    </span>
                                                    <input type="file" className="hidden" accept="application/pdf" onChange={e => handleFileUpload(e, 'brochurePdf')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Images */}
                                <div className="space-y-3 pt-4 border-t border-primary/10">
                                    <div className="flex justify-between items-center">
                                        <Label className="font-semibold text-xs uppercase opacity-75">Gallery Images</Label>
                                        <label className="cursor-pointer bg-primary text-white text-xs font-bold h-8 px-4 rounded-lg flex items-center gap-1 hover:bg-primary/95 transition shadow shadow-primary/15">
                                            <Upload size={14} /> Upload Images
                                            <input type="file" className="hidden" multiple accept="image/*" onChange={e => handleFileUpload(e, 'gallery')} />
                                        </label>
                                    </div>

                                    {gallery.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-4">
                                            {gallery.map((img, idx) => (
                                                <div key={idx} className="p-2 border border-primary/10 rounded-xl bg-card space-y-2 relative group shadow-sm">
                                                    <Button size="icon" variant="ghost" className="absolute top-1.5 right-1.5 h-6 w-6 text-red-500 hover:bg-red-50 rounded" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}>
                                                        <Trash2 size={13} />
                                                    </Button>
                                                    <img src={img.imageUrl} className="h-20 w-full rounded-lg object-cover" alt="Gallery Preview" />
                                                    <Input placeholder="Caption..." className="h-7 text-[10px] rounded font-bold px-2 border-primary/15" value={img.caption} onChange={e => {
                                                        const copy = [...gallery];
                                                        copy[idx].caption = e.target.value;
                                                        setGallery(copy);
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-xs font-semibold bg-muted/5 border border-dashed border-primary/15 rounded-xl">No gallery images uploaded.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between items-center bg-card p-3.5 border border-primary/10 rounded-2xl shadow-sm">
                    <Button variant="ghost" disabled={step === 1} className="h-10 rounded-xl font-bold border border-primary/10 gap-1.5" onClick={() => setStep(step - 1)}>
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-primary/10 text-muted-foreground" onClick={() => router.push('/dashboard/events')}>Cancel</Button>
                        {step < 5 ? (
                            <Button className="h-10 px-5 rounded-xl font-bold gap-1.5" onClick={() => setStep(step + 1)}>
                                Next <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button disabled={saving} className="h-10 px-5 rounded-xl font-bold gap-1.5 shadow-lg shadow-primary/10" onClick={handleSave}>
                                {saving ? 'Updating...' : <>Save and Close <Save size={16} /></>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </RequireBranch>
    );
}

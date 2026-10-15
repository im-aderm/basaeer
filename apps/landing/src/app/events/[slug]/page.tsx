'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { EventsService, CampusEvent } from '@/services/eventsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    CheckCircle,
    BookOpen,
    ShieldAlert,
    Coffee,
    HelpCircle,
    ArrowRight,
    Loader2,
    FileText,
    Image as ImageIcon,
    Clock
} from 'lucide-react';
import Image from 'next/image';

const CATEGORY_NAMES: Record<string, string> = {
  CAMP: 'Camp',
  CONFERENCE: 'Conference',
  COMPETITION: 'Competition',
  WORKSHOP: 'Workshop',
  EXCURSION: 'Excursion',
  SUMMER_PROGRAM: 'Summer Program',
  TAHFIZ_PROGRAM: 'Tahfiz Program',
  ACADEMIC_PROGRAM: 'Academic Program',
  OTHERS: 'Other Event',
};

export default function EventDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [event, setEvent] = useState<CampusEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEDULE' | 'RULES'>('OVERVIEW');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const loadEvent = async () => {
            if (!slug) return;
            try {
                const data = await EventsService.getPublicEventBySlug(slug);
                setEvent(data);
            } catch (error) {
                // error handled or fallback
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-2.5 font-bold text-sm text-text-secondary">Loading program details...</span>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center text-center p-8 space-y-4">
                <ShieldAlert className="h-16 w-16 text-primary" />
                <h1 className="text-3xl font-bold font-heading">Event Not Found</h1>
                <p className="text-text-secondary max-w-md">The requested program does not exist, is inactive, or has been archived.</p>
                <Link href="/events"><Button>Return to Events</Button></Link>
            </div>
        );
    }

    const minFee = event.packages && event.packages.length > 0
        ? Math.min(...event.packages.map(p => Number(p.fee)))
        : 0;

    const startDate = new Date(event.startDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const endDate = new Date(event.endDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
            <GradientBackground />
            <Navbar />

            {/* Hero Banner Banner */}
            <div className="relative pt-32 pb-16 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge className="bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow shadow-primary/20">
                            {CATEGORY_NAMES[event.categoryLabel] || event.categoryLabel}
                        </Badge>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-heading text-text-primary">
                            {event.title}
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                            {event.shortDescription || 'Participate in our signature event, harmonizing moral growth with academic excellence.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-secondary pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Calendar size={18} /></div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none block">Duration</span>
                                    <span>{new Date(event.startDate).toLocaleDateString([], {month:'short', day:'numeric'})} - {new Date(event.endDate).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><MapPin size={18} /></div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none block">Venue</span>
                                    <span className="truncate max-w-[160px] block" title={event.location}>{event.location || 'Campus Wide'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            {event.registrationOpen && event.applicationFormEnabled ? (
                                <Link href={`/events/${event.slug}/apply`}>
                                    <Button className="h-12 px-8 rounded-full font-bold gap-2 text-sm shadow-xl shadow-primary/25 hover:scale-[1.02] transition">
                                        Register Now <ArrowRight size={15} />
                                    </Button>
                                </Link>
                            ) : (
                                <Button disabled className="h-12 px-8 rounded-full font-bold text-sm bg-muted text-muted-foreground">
                                    Registration Closed
                                </Button>
                            )}
                            {event.brochurePdf && (
                                <a href={event.brochurePdf} target="_blank" rel="noreferrer">
                                    <Button variant="outline" className="h-12 px-6 rounded-full font-bold text-sm border-border hover:bg-white/5 gap-1.5 text-text-primary">
                                        <FileText size={16} /> Syllabus PDF
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Featured Image Frame */}
                    <div className="relative h-80 lg:h-96 w-full rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-muted">
                        <Image
                            fill
                            className="object-cover"
                            alt={event.title}
                            src={event.featuredImage || '/placeholder.svg'}
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.svg';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Tabs Buttons */}
                    <div className="flex border-b border-border/50 gap-6 font-bold text-sm">
                        <button onClick={() => setActiveTab('OVERVIEW')} className={`pb-3.5 border-b-2 transition ${activeTab === 'OVERVIEW' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Overview</button>
                        <button onClick={() => setActiveTab('SCHEDULE')} className={`pb-3.5 border-b-2 transition ${activeTab === 'SCHEDULE' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Schedule</button>
                        <button onClick={() => setActiveTab('RULES')} className={`pb-3.5 border-b-2 transition ${activeTab === 'RULES' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Rules & Guidelines</button>
                    </div>

                    {/* Tab 1: Overview */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-10">
                            {/* Description */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold font-heading text-foreground">Program Details</h2>
                                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{event.fullDescription || 'No detailed description provided.'}</p>
                            </div>

                            {/* Objectives */}
                            {event.objectives && event.objectives.length > 0 && (
                                <div className="space-y-4 bg-surface-container/20 p-6 rounded-3xl border border-border/50">
                                    <h3 className="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-1.5">
                                        <BookOpen size={16} /> Key Objectives
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-text-secondary pt-2">
                                        {event.objectives.map((obj, i) => (
                                            <li key={i} className="flex gap-2 items-start">
                                                <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                                                <span>{obj}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Why Choose */}
                            {event.whyChooseThisEvent && event.whyChooseThisEvent.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold font-heading">Why Register?</h2>
                                    <ul className="space-y-3 text-xs font-semibold text-text-secondary">
                                        {event.whyChooseThisEvent.map((why, i) => (
                                            <li key={i} className="flex gap-2 items-start">
                                                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{i+1}</span>
                                                <span className="leading-relaxed">{why}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Photo Gallery */}
                            {event.gallery && event.gallery.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-border/40">
                                    <h2 className="text-xl font-bold font-heading flex items-center gap-1.5">
                                        <ImageIcon size={18} className="text-primary" /> Album Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {event.gallery.map((img) => (
                                            <div
                                                key={img.id}
                                                className="h-28 relative rounded-2xl overflow-hidden border border-border/60 hover:border-primary cursor-pointer transition shadow-sm bg-muted"
                                                onClick={() => setSelectedImage(img.imageUrl)}
                                            >
                                                <Image fill className="object-cover" alt="Gallery item" src={img.imageUrl} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Schedule */}
                    {activeTab === 'SCHEDULE' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold font-heading text-foreground">Structured Program Schedule</h2>
                            {event.schedules && event.schedules.length > 0 ? (
                                <div className="space-y-6 pt-2">
                                    {event.schedules.map((sch) => (
                                        <div key={sch.id} className="flex gap-4 items-start p-4 bg-surface-container/20 border border-border/50 rounded-2xl shadow-sm">
                                            <div className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-center text-xs shrink-0 select-none">
                                                {sch.day}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                                    <Clock size={12} className="text-primary" />
                                                    <span>{sch.startTime} - {sch.endTime}</span>
                                                    {sch.period && (
                                                        <>
                                                            <span className="opacity-40">•</span>
                                                            <span className="uppercase text-[9px] tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded">{sch.period}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-text-primary leading-tight mt-1">{sch.activity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground text-xs font-semibold bg-surface-container/10 border border-dashed border-border rounded-3xl">No schedule has been published yet.</div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Rules & Guidelines */}
                    {activeTab === 'RULES' && (
                        <div className="space-y-8">
                            {/* Rules & Discipline */}
                            {event.rulesAndDiscipline && (
                                <div className="space-y-3 bg-red-500/[0.02] border border-red-500/10 p-6 rounded-3xl">
                                    <h3 className="font-bold text-sm text-red-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <ShieldAlert size={16} /> Rules & Discipline Guidelines
                                    </h3>
                                    <p className="text-text-secondary text-xs font-semibold leading-relaxed whitespace-pre-wrap">{event.rulesAndDiscipline}</p>
                                </div>
                            )}

                            {/* Meals & Hospitality */}
                            {event.mealsAndHospitality && (
                                <div className="space-y-3 bg-emerald-500/[0.02] border border-emerald-500/10 p-6 rounded-3xl">
                                    <h3 className="font-bold text-sm text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <Coffee size={16} /> Meals & Hospitality
                                    </h3>
                                    <p className="text-text-secondary text-xs font-semibold leading-relaxed whitespace-pre-wrap">{event.mealsAndHospitality}</p>
                                </div>
                            )}

                            {/* Requirements Checklist */}
                            {event.requirements && event.requirements.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold font-heading text-foreground">Criteria & Checklist</h2>
                                    <ul className="space-y-2.5 text-xs font-semibold text-text-secondary">
                                        {event.requirements.map((req, i) => (
                                            <li key={i} className="flex gap-2 items-start">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">✔</div>
                                                <span className="leading-relaxed">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Packages Board */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm overflow-hidden shadow-xl sticky top-24">
                        <CardHeader className="bg-primary/5 border-b border-border/50 p-6">
                            <CardTitle className="text-base font-bold text-foreground uppercase tracking-wide">Packages & Fees</CardTitle>
                            <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">Select a package to continue registration</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                {event.packages && event.packages.length > 0 ? (
                                    event.packages.map((pkg) => (
                                        <div key={pkg.id} className="p-4 rounded-2xl border border-border/60 bg-background/50 space-y-2.5 hover:border-primary transition shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-text-primary leading-snug">{pkg.title}</h4>
                                                <span className="text-xs font-extrabold text-primary font-heading shrink-0 ml-2">₦{Number(pkg.fee).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                                                <Badge variant="secondary" className="px-2 py-0.5 rounded text-[8px]">{pkg.boardingType.replace('_', ' ')}</Badge>
                                                {pkg.ageRange && <Badge variant="secondary" className="px-2 py-0.5 rounded text-[8px]">Ages {pkg.ageRange}</Badge>}
                                                {pkg.timing && <Badge variant="secondary" className="px-2 py-0.5 rounded text-[8px]">{pkg.timing}</Badge>}
                                            </div>
                                            {pkg.description && (
                                                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed pt-1.5 border-t border-border/40">{pkg.description}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-xs font-semibold">No packages set.</div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border/40 space-y-3">
                                {event.registrationOpen && event.applicationFormEnabled ? (
                                    <Link href={`/events/${event.slug}/apply`} className="block w-full">
                                        <Button className="w-full h-12 rounded-full font-bold uppercase tracking-wider text-xs gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.01] transition">
                                            Apply Online <ArrowRight size={14} />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full h-12 rounded-full font-bold uppercase tracking-wider text-xs bg-muted text-muted-foreground">
                                        Registration Closed
                                    </Button>
                                )}
                                <div className="text-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                        Deadline: {event.applicationDeadline ? new Date(event.applicationDeadline).toLocaleDateString([], {month:'long', day:'numeric', year:'numeric'}) : 'Until filled'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-h-[85vh] max-w-[85vw] rounded-2xl overflow-hidden shadow-2xl">
                        <img src={selectedImage} className="max-h-[80vh] w-auto rounded-xl object-contain border border-white/10" alt="Expanded display" />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

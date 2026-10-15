'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { EventsService, CampusEvent } from '@/services/eventsService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Search, ArrowRight, Loader2, Compass, AlertCircle } from 'lucide-react';
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

export default function PublicEventsPage() {
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await EventsService.getPublicEvents();
                setEvents(data);
            } catch (error) {
                // Handle error silently or show fallback
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const categories = ['ALL', 'CAMP', 'TAHFIZ_PROGRAM', 'COMPETITION', 'WORKSHOP', 'EXCURSION', 'SUMMER_PROGRAM', 'ACADEMIC_PROGRAM'];

    // Filter events
    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (e.shortDescription && e.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'ALL' || e.categoryLabel === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 overflow-hidden">
            <GradientBackground />
            <Navbar />

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
                {/* Hero Head */}
                <div className="space-y-4 text-center max-w-3xl mx-auto">
                    <span className="text-primary font-bold text-xs tracking-widest uppercase block">
                        Spiritual & Academic Development
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none font-heading">
                        Basaeer <span className="text-primary drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Camps & Programs</span>
                    </h1>
                    <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                        Grounding character in Islamic excellence. Join our specialized Tahfiz retreats, leadership camps, academic workshops, and national competitions.
                    </p>
                </div>

                {/* Filter and Search board */}
                <div className="bg-surface-container/30 backdrop-blur-md p-4 rounded-[2rem] border border-border/50 space-y-4">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search events by program title or details..."
                            className="pl-12 h-12 rounded-2xl bg-background/50 border-none font-semibold text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                                    activeCategory === cat
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-background/40 hover:bg-white/10 text-text-secondary'
                                }`}
                            >
                                {cat === 'ALL' ? 'All Programs' : (CATEGORY_NAMES[cat] || cat)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Listing Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-40">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="ml-2.5 font-bold text-sm text-text-secondary">Loading active programs...</span>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-50 bg-surface-container/20 rounded-[2.5rem] border border-dashed border-border">
                        <Compass className="h-16 w-16 text-primary animate-pulse" />
                        <h3 className="text-xl font-bold font-heading">No Active Events Found</h3>
                        <p className="text-sm font-semibold max-w-md text-text-secondary">We are currently planning upcoming camps and workshops. Subscribe to notifications or check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => {
                            const minFee = event.packages && event.packages.length > 0
                                ? Math.min(...event.packages.map(p => Number(p.fee)))
                                : 0;
                            
                            const startDate = new Date(event.startDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
                            const endDate = new Date(event.endDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
                            
                            return (
                                <Card key={event.id} className="rounded-[2.5rem] border-border bg-surface-container/30 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-500 flex flex-col justify-between shadow-lg">
                                    <div className="relative h-56 w-full overflow-hidden border-b border-border/50 bg-muted">
                                        <Image
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={event.title}
                                            src={event.featuredImage || '/placeholder.svg'}
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.src = '/placeholder.svg';
                                            }}
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-primary hover:bg-primary text-white font-bold text-[9px] uppercase tracking-wider py-1 px-3.5 rounded-full shadow shadow-primary/20">
                                                {CATEGORY_NAMES[event.categoryLabel] || event.categoryLabel}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6.5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold font-heading group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                                            <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">{event.shortDescription || 'Participate in our leading spiritual and intellectual retreat.'}</p>
                                        </div>
                                        
                                        <div className="space-y-2 pt-3 border-t border-border/40 text-xs font-semibold text-text-secondary">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-primary shrink-0" />
                                                <span>{startDate} - {endDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-primary shrink-0" />
                                                <span className="truncate">{event.location || 'Campus Wide'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-text-secondary block tracking-wider leading-none">Starting Fee</span>
                                                <span className="text-base font-extrabold text-primary font-heading">
                                                    {minFee > 0 ? `₦${minFee.toLocaleString()}` : 'Free'}
                                                </span>
                                            </div>
                                            <Link href={`/events/${event.slug}`}>
                                                <Button className="h-9 px-4.5 rounded-full text-xs font-bold gap-1 transition-all duration-300">
                                                    View Details <ArrowRight size={13} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useNotification } from '@/context/NotificationContext';
import { EventsService, CampusEvent, EventGallery } from '@/services/eventsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import {
    Loader2,
    Upload,
    Trash2,
    CheckCircle2,
    Eye,
    Plus,
    FileImage,
    Image as ImageIcon,
    FolderOpen,
    Folder
} from 'lucide-react';

export default function GalleryPage() {
    const { showError, showSuccess } = useNotification();
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await EventsService.getEvents();
            setEvents(data);
            if (data.length > 0) {
                setSelectedEventId(data[0].id);
            }
        } catch (error) {
            showError('Failed to load events list for gallery');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Currently selected event
    const activeEvent = useMemo(() => {
        return events.find(e => e.id === selectedEventId) || null;
    }, [events, selectedEventId]);

    const activeGallery = useMemo(() => {
        return activeEvent?.gallery || [];
    }, [activeEvent]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedEventId) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                const res = await api.post('/upload/admission-document?category=events', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(res.data.url);
            }

            // Sync with backend by adding new images to current list and updating the event
            const updatedGallery = [
                ...activeGallery.map(g => ({ imageUrl: g.imageUrl, isCover: g.isCover, order: g.order, caption: g.caption })),
                ...uploadedUrls.map((url, index) => ({
                    imageUrl: url,
                    isCover: false,
                    order: activeGallery.length + index,
                    caption: ''
                }))
            ];

            const payload = {
                title: activeEvent!.title,
                category: activeEvent!.categoryLabel,
                startDate: activeEvent!.startDate,
                endDate: activeEvent!.endDate,
                isPublic: activeEvent!.isPublic,
                allowRSVP: activeEvent!.allowRSVP,
                status: activeEvent!.status,
                active: activeEvent!.active,
                rulesAndDiscipline: activeEvent!.rulesAndDiscipline,
                mealsAndHospitality: activeEvent!.mealsAndHospitality,
                objectives: activeEvent!.objectives,
                requirements: activeEvent!.requirements,
                whyChooseThisEvent: activeEvent!.whyChooseThisEvent,
                featuredImage: activeEvent!.featuredImage || undefined,
                brochurePdf: activeEvent!.brochurePdf || undefined,
                capacity: activeEvent!.capacity,
                registrationOpen: activeEvent!.registrationOpen,
                applicationFormEnabled: activeEvent!.applicationFormEnabled,
                paymentRequired: activeEvent!.paymentRequired,
                seoMetadata: activeEvent!.seoMetadata,
                packages: activeEvent!.packages || [],
                schedules: activeEvent!.schedules || [],
                gallery: updatedGallery
            };

            await EventsService.updateEvent(selectedEventId, payload);
            showSuccess('Images uploaded and synced successfully');
            
            // Reload local list
            const refresh = await EventsService.getEvents();
            setEvents(refresh);

        } catch (error) {
            showError('Failed to upload and sync gallery images');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this gallery image?')) return;
        
        try {
            const updatedGallery = activeGallery
                .filter(g => g.id !== imageId)
                .map(g => ({ imageUrl: g.imageUrl, isCover: g.isCover, order: g.order, caption: g.caption }));

            const payload = {
                title: activeEvent!.title,
                category: activeEvent!.categoryLabel,
                startDate: activeEvent!.startDate,
                endDate: activeEvent!.endDate,
                isPublic: activeEvent!.isPublic,
                allowRSVP: activeEvent!.allowRSVP,
                status: activeEvent!.status,
                active: activeEvent!.active,
                rulesAndDiscipline: activeEvent!.rulesAndDiscipline,
                mealsAndHospitality: activeEvent!.mealsAndHospitality,
                objectives: activeEvent!.objectives,
                requirements: activeEvent!.requirements,
                whyChooseThisEvent: activeEvent!.whyChooseThisEvent,
                featuredImage: activeEvent!.featuredImage || undefined,
                brochurePdf: activeEvent!.brochurePdf || undefined,
                capacity: activeEvent!.capacity,
                registrationOpen: activeEvent!.registrationOpen,
                applicationFormEnabled: activeEvent!.applicationFormEnabled,
                paymentRequired: activeEvent!.paymentRequired,
                seoMetadata: activeEvent!.seoMetadata,
                packages: activeEvent!.packages || [],
                schedules: activeEvent!.schedules || [],
                gallery: updatedGallery
            };

            await EventsService.updateEvent(selectedEventId, payload);
            showSuccess('Image deleted successfully');
            
            const refresh = await EventsService.getEvents();
            setEvents(refresh);

        } catch (error) {
            showError('Failed to delete gallery image');
        }
    };

    const handleSetCover = async (imageUrl: string) => {
        try {
            // Set cover state: cover for selected, false for others
            const updatedGallery = activeGallery.map(g => ({
                imageUrl: g.imageUrl,
                isCover: g.imageUrl === imageUrl,
                order: g.order,
                caption: g.caption
            }));

            const payload = {
                ...activeEvent,
                featuredImage: imageUrl, // Update featured banner as well
                gallery: updatedGallery
            };

            await EventsService.updateEvent(selectedEventId, payload);
            showSuccess('Cover image set successfully');
            
            const refresh = await EventsService.getEvents();
            setEvents(refresh);

        } catch (error) {
            showError('Failed to update cover image');
        }
    };

    const handleCaptionUpdate = async (imageId: string, caption: string) => {
        try {
            const updatedGallery = activeGallery.map(g => ({
                imageUrl: g.imageUrl,
                isCover: g.isCover,
                order: g.order,
                caption: g.id === imageId ? caption : g.caption
            }));

            const payload = {
                ...activeEvent,
                gallery: updatedGallery
            };

            await EventsService.updateEvent(selectedEventId, payload);
            
            // Debounced or simple notification
            const refresh = await EventsService.getEvents();
            setEvents(refresh);

        } catch (error) {
            // Silently handle error to prevent disruption during writing
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Media Gallery</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Manage public album assets, configure event banners, verify descriptions.</p>
                    </div>
                </div>

                {/* Selector Board */}
                <div className="grid gap-4 md:grid-cols-4 bg-card p-4 rounded-2xl border border-primary/10 shadow-sm items-center">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Active Event Album</label>
                        <select
                            className="h-10 w-full px-3 text-sm font-semibold rounded-xl bg-background border border-primary/20 outline-none cursor-pointer"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            {loading ? (
                                <option>Loading events...</option>
                            ) : events.length === 0 ? (
                                <option>No events found</option>
                            ) : (
                                events.map(e => (
                                    <option key={e.id} value={e.id}>{e.title}</option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-5 w-full">
                        {activeEvent && (
                            <label className="cursor-pointer bg-primary text-white text-xs font-bold h-10 px-5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/95 transition shadow shadow-primary/15 w-full md:w-auto">
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} /> Upload Media Items
                                    </>
                                )}
                                <input type="file" className="hidden" multiple accept="image/*" disabled={uploading} onChange={handleUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Gallery List Grid */}
                {activeEvent ? (
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Media Album: {activeEvent.title}</CardTitle>
                            <CardDescription>Configure captions, set covers, or delete images in this event album</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeGallery.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {activeGallery.map((img) => (
                                        <div key={img.id} className="p-3 border border-primary/10 rounded-2xl bg-card space-y-3 relative group shadow-sm flex flex-col justify-between">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-2 right-2 h-7 w-7 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200"
                                                onClick={() => handleDeleteImage(img.id!)}
                                                title="Delete Image"
                                            >
                                                <Trash2 size={14} />
                                            </Button>

                                            <div className="relative h-28 rounded-lg overflow-hidden">
                                                <img src={img.imageUrl} className="h-full w-full object-cover" alt="Gallery preview" />
                                                {img.isCover && (
                                                    <div className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-white font-bold text-[8px] uppercase tracking-wider py-0.5 px-2 rounded-md shadow shadow-emerald-500/35">Cover</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Add Caption..."
                                                    className="h-8 text-[11px] font-semibold border-primary/15 rounded-lg px-2 text-foreground"
                                                    value={img.caption || ''}
                                                    onChange={e => handleCaptionUpdate(img.id!, e.target.value)}
                                                />
                                                {!img.isCover && (
                                                    <Button
                                                        variant="ghost"
                                                        className="h-7 w-full text-[10px] font-bold rounded-lg border border-primary/10 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                        onClick={() => handleSetCover(img.imageUrl)}
                                                    >
                                                        Set as Cover
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground text-sm font-semibold flex flex-col items-center justify-center gap-2">
                                    <ImageIcon className="h-10 w-10 opacity-30 text-primary animate-pulse" />
                                    <span>No gallery images found in this album. Click "Upload Media Items" to add photo assets.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-20 text-muted-foreground text-sm font-semibold flex flex-col items-center justify-center gap-2">
                        <Folder className="h-10 w-10 opacity-30 text-primary" />
                        <span>No event select or active branch has no events scheduled.</span>
                    </div>
                )}
            </div>
        </RequireBranch>
    );
}

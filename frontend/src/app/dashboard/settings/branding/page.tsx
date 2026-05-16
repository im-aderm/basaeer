'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Save, Image, Mail, MessageSquare, School } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function BrandingSettingsPage() {
    const { user, resolvedBranchId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        logoUrl: '',
        primaryColor: '#2563EB',
        emailFooter: '',
        smsSenderId: 'BASAER',
    });

    useEffect(() => {
        if (!resolvedBranchId) {
            setLoading(false);
            return;
        }
        const fetchBranding = async () => {
            try {
                const res = await api.get(`/branches/${resolvedBranchId}/branding`);
                const data = res.data;
                setForm({
                    name: data.name || '',
                    logoUrl: data.logoUrl || '',
                    primaryColor: data.primaryColor || '#2563EB',
                    emailFooter: data.emailFooter || '',
                    smsSenderId: data.smsSenderId || 'BASAER',
                });
            } catch {
                toast.error('Failed to load branding');
            } finally {
                setLoading(false);
            }
        };
        fetchBranding();
    }, [resolvedBranchId]);

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!resolvedBranchId) return;
        setIsSaving(true);
        try {
            await api.patch(`/branches/${resolvedBranchId}/branding`, {
                logoUrl: form.logoUrl || undefined,
                primaryColor: form.primaryColor,
                emailFooter: form.emailFooter || undefined,
                smsSenderId: form.smsSenderId,
            });
            toast.success('Branding settings saved');
        } catch {
            toast.error('Failed to save branding');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading branding...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">School Branding</h1>
                    <p className="text-muted-foreground font-medium mt-1">Customize your school&apos;s visual identity and communication defaults.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Save className="h-5 w-5" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branding Form */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                        <CardHeader className="bg-primary/5 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-h3 font-semibold">Branding Settings</CardTitle>
                                    <CardDescription className="font-medium">Colors, logo, and communication defaults.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">School Name</Label>
                                <div className="relative">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Basaer School"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Logo URL</Label>
                                <div className="relative">
                                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                        value={form.logoUrl}
                                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Primary Color</Label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative">
                                        <Input
                                            type="color"
                                            className="h-12 w-16 rounded-2xl border-border/50 bg-background/50 cursor-pointer"
                                            value={form.primaryColor}
                                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        className="h-12 rounded-2xl border-border/50 bg-background/50 font-mono font-bold flex-1"
                                        value={form.primaryColor}
                                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                                        placeholder="#2563EB"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Email Footer</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        className="pl-11 h-24 w-full rounded-2xl border border-primary/90 bg-white font-bold p-4 pt-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={form.emailFooter}
                                        onChange={(e) => handleChange('emailFooter', e.target.value)}
                                        placeholder="Thank you,&#10;School Administration"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">SMS Sender ID</Label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                        value={form.smsSenderId}
                                        onChange={(e) => handleChange('smsSenderId', e.target.value)}
                                        placeholder="BASAER"
                                        maxLength={11}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden sticky top-8">
                        <CardHeader className="pb-6" style={{ backgroundColor: form.primaryColor + '10' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: form.primaryColor + '20', color: form.primaryColor }}>
                                    <Palette className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-h3 font-semibold">Preview</CardTitle>
                                    <CardDescription className="font-medium">See how your branding looks.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {/* Colored Header Preview */}
                            <div className="rounded-2xl overflow-hidden border border-border/50">
                                <div className="p-6 text-white" style={{ backgroundColor: form.primaryColor }}>
                                    <div className="flex items-center gap-4">
                                        {form.logoUrl ? (
                                            <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-cover bg-white/20" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                                                {form.name.charAt(0) || 'B'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold">{form.name || 'Basaer School'}</h3>
                                            <p className="text-sm opacity-80">School Management System</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-background text-sm text-muted-foreground">
                                    This is how the header will appear in emails and portals.
                                </div>
                            </div>

                            {/* Email Footer Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Email Footer Preview</Label>
                                <div className="rounded-2xl border border-border/50 p-4 bg-background/50 text-sm">
                                    {form.emailFooter ? (
                                        form.emailFooter.split('\n').map((line, i) => (
                                            <p key={i} className="text-muted-foreground">{line}</p>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground italic">No email footer set</p>
                                    )}
                                    <hr className="my-3 border-border/50" />
                                    <p className="text-xs text-muted-foreground">
                                        &copy; {new Date().getFullYear()} {form.name || 'Basaer School'}. All rights reserved.
                                    </p>
                                </div>
                            </div>

                            {/* SMS Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">SMS Preview</Label>
                                <div className="rounded-2xl border border-border/50 p-4 bg-background/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From:</span>
                                        <span className="text-sm font-bold" style={{ color: form.primaryColor }}>{form.smsSenderId || 'BASAER'}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Dear Parent, this is a notification from {form.name || 'Basaer School'}.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

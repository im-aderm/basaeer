'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Globe, Phone, Mail, MapPin, Coins, Languages, School } from 'lucide-react';
import { SettingsService, GlobalSetting } from '@/services/settingsService';
import { useNotification } from '@/context/NotificationContext';

export default function GeneralSettingsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [settings, setSettings] = useState<Record<string, string>>({
        school_name: '',
        school_address: '',
        school_phone: '',
        school_email: '',
        currency_symbol: '$',
        language: 'English',
        timezone: 'UTC'
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                const settingsMap: Record<string, string> = {};
                data.forEach(s => {
                    settingsMap[s.key] = s.value;
                });
                setSettings(prev => ({ ...prev, ...settingsMap }));
            } catch (error) {
                showError('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = Object.entries(settings).map(([key, value]) =>
                SettingsService.updateSetting(key, value)
            );
            await Promise.all(promises);
            showSuccess('Settings updated successfully');
        } catch (error) {
            showError('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">System Settings</h1>
                    <p className="text-muted-foreground font-medium mt-1">Configure global parameters and school information.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Save className="h-5 w-5" />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* School Information */}
                <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                    <CardHeader className="bg-primary/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <School className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 font-semibold">School Profile</CardTitle>
                                <CardDescription className="font-medium">Primary details for reports and communication.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">School Name</Label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={settings.school_name}
                                    onChange={(e) => handleChange('school_name', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Official Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={settings.school_email}
                                    onChange={(e) => handleChange('school_email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Contact Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={settings.school_phone}
                                    onChange={(e) => handleChange('school_phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Location Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={settings.school_address}
                                    onChange={(e) => handleChange('school_address', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional & Financial */}
                <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-emerald-500/20">
                    <CardHeader className="bg-emerald-500/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Coins className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 font-semibold">Localization</CardTitle>
                                <CardDescription className="font-medium">Currency and regional preferences.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Currency Symbol</Label>
                            <Input
                                className="h-12 rounded-2xl border-border/50 bg-background/50 font-bold text-center text-2xl"
                                value={settings.currency_symbol}
                                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">System Language</Label>
                            <div className="relative">
                                <Languages className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={settings.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>
        </RequireBranch>
    );
}

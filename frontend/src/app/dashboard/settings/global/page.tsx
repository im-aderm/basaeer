"use client";

import { useState, useEffect } from "react";
import { SettingsService, GlobalSetting } from "@/services/settingsService";
import { Save, Loader2, Globe, School, Coins, Clock, Bell, ShieldCheck } from "lucide-react";

export default function GlobalSettingsPage() {
    const [settings, setSettings] = useState<GlobalSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({
        school_name: "",
        currency: "USD",
        timezone: "UTC",
        language: "English",
        contact_email: "",
        phone_suffix: "+234"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
                const mapped: Record<string, string> = { ...formData };
                data.forEach(s => {
                    mapped[s.key] = s.value;
                });
                setFormData(mapped);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (key: string) => {
        setSaving(true);
        try {
            await SettingsService.updateSetting(key, formData[key]);
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            for (const key of Object.keys(formData)) {
                await SettingsService.updateSetting(key, formData[key]);
            }
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save all settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight">Global Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure system-wide parameters and regional preferences.</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save All Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Information */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <School size={20} />
                            </div>
                            <h2 className="font-bold">Institution Profile</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">School Name</label>
                                    <input
                                        name="school_name"
                                        value={formData.school_name}
                                        onChange={handleChange}
                                        placeholder="Basaer International School"
                                        className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Contact Email</label>
                                    <input
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        placeholder="admin@basaer.com"
                                        className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Regional Settings */}
                    <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <Globe size={20} />
                            </div>
                            <h2 className="font-bold">Localization</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Coins size={14} /> Currency
                                    </label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-background border border-input rounded-xl outline-none"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="NGN">NGN (₦)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock size={14} /> Timezone
                                    </label>
                                    <select
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-background border border-input rounded-xl outline-none"
                                    >
                                        <option value="UTC">UTC (GMT)</option>
                                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                                        <option value="America/New_York">EST (New York)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">System Language</label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-background border border-input rounded-xl outline-none"
                                    >
                                        <option value="English">English</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="French">French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column / Quick Info */}
                <div className="space-y-6">
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck size={20} />
                            <h3 className="font-bold text-sm">Deployment Info</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-mono">v1.2.4-stable</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">License</span>
                                <span className="text-green-600 font-semibold">Enterprise Perpetual</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Sync</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Bell size={20} />
                            <h3 className="font-bold text-sm">Notifications</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Global settings affect all modules. Some branch-specific settings might override these values in multi-campus mode.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

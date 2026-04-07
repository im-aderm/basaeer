"use client";

import { useState, useEffect } from "react";
import { SettingsService } from "@/services/settingsService";
import { Save, Loader2, Settings2, Users, MessageSquare, Info, Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ReceptionConfigPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"sources" | "purposes" | "complaints">("sources");

    const [config, setConfig] = useState({
        reception_enquiry_sources: ["Advertisement", "Walk-in", "Referral", "Social Media", "Newspaper", "Other"],
        reception_visitor_purposes: ["Meeting", "Delivery", "Personal", "Admission", "Vendor", "Other"],
        reception_complaint_types: ["Academic", "Infrastructure", "Financial", "Staff Behavior", "Transport", "Other"]
    });

    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const settings = await SettingsService.getSettings();
                const newConfig = { ...config };

                settings.forEach(s => {
                    if (s.key === "reception_enquiry_sources") newConfig.reception_enquiry_sources = JSON.parse(s.value);
                    if (s.key === "reception_visitor_purposes") newConfig.reception_visitor_purposes = JSON.parse(s.value);
                    if (s.key === "reception_complaint_types") newConfig.reception_complaint_types = JSON.parse(s.value);
                });

                setConfig(newConfig);
            } catch (error) {
                console.error("Failed to fetch reception config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await SettingsService.updateSetting("reception_enquiry_sources", JSON.stringify(config.reception_enquiry_sources));
            await SettingsService.updateSetting("reception_visitor_purposes", JSON.stringify(config.reception_visitor_purposes));
            await SettingsService.updateSetting("reception_complaint_types", JSON.stringify(config.reception_complaint_types));
            alert("Reception configuration saved successfully!");
        } catch (error) {
            console.error("Failed to save config:", error);
            alert("Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        if (!newItem.trim()) return;
        const key = activeTab === "sources" ? "reception_enquiry_sources" :
            activeTab === "purposes" ? "reception_visitor_purposes" : "reception_complaint_types";

        if (config[key].includes(newItem.trim())) {
            alert("Item already exists!");
            return;
        }

        setConfig({
            ...config,
            [key]: [...config[key], newItem.trim()]
        });
        setNewItem("");
    };

    const removeItem = (item: string) => {
        const key = activeTab === "sources" ? "reception_enquiry_sources" :
            activeTab === "purposes" ? "reception_visitor_purposes" : "reception_complaint_types";

        setConfig({
            ...config,
            [key]: config[key].filter(i => i !== item)
        });
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentList = activeTab === "sources" ? config.reception_enquiry_sources :
        activeTab === "purposes" ? config.reception_visitor_purposes : config.reception_complaint_types;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight">Reception Setup</h1>
                    <p className="text-muted-foreground mt-1">Configure dropdown values for the Reception module.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Tabs Sidebar */}
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab("sources")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "sources" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-muted"}`}
                    >
                        <Settings2 size={18} />
                        <span className="text-sm font-medium">Enquiry Sources</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("purposes")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "purposes" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-muted"}`}
                    >
                        <Users size={18} />
                        <span className="text-sm font-medium">Visitor Purposes</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("complaints")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "complaints" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-muted"}`}
                    >
                        <MessageSquare size={18} />
                        <span className="text-sm font-medium">Complaint Types</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-bold capitalize">{activeTab.replace('_', ' ')} Management</h2>
                            <p className="text-sm text-muted-foreground">Add or remove items that will appear in dropdown menus.</p>
                        </div>

                        {/* Add Item */}
                        <div className="flex gap-2">
                            <input
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addItem()}
                                placeholder={`New ${activeTab.slice(0, -1)}...`}
                                className="flex-1 p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <button
                                onClick={addItem}
                                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {currentList.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-full text-sm font-medium group transition-all hover:border-primary/50"
                                >
                                    {item}
                                    <button
                                        onClick={() => removeItem(item)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {currentList.length === 0 && (
                                <div className="w-full py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                                    No items added yet.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border flex items-start gap-3 text-xs text-muted-foreground">
                            <Info size={14} className="mt-0.5 text-primary" />
                            <p>
                                These values will be available globally for all users in the {user?.branchId ? 'current branch' : 'system'}.
                                Make sure to save changes after adding or removing items.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

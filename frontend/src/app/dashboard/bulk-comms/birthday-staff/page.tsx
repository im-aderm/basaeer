"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import { Cake, Save, RefreshCcw, Bell, Mail, Smartphone, AlertCircle } from "lucide-react";
import { commsService, AutomationConfig, EmailTemplate, SmsTemplate } from "@/services/commsService";
import { useNotification } from '@/context/NotificationContext';

export default function StaffBirthdayPage() {
    const { showSuccess, showError } = useNotification();
    const [config, setConfig] = useState<Partial<AutomationConfig>>({
        type: "STAFF_BIRTHDAY",
        isEnabled: false,
        template: ""
    });
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [configsRes, emailRes, smsRes] = await Promise.all([
                    commsService.getAutomationConfigs(),
                    commsService.getEmailTemplates(),
                    commsService.getSmsTemplates()
                ]);
                
                const existingConfig = configsRes.data.find(c => c.type === "STAFF_BIRTHDAY");
                if (existingConfig) setConfig(existingConfig);
                
                setEmailTemplates(emailRes.data.filter(t => t.type === "BIRTHDAY"));
                setSmsTemplates(smsRes.data.filter(t => t.type === "BIRTHDAY"));
            } catch (error) {
                showError("Failed to load birthday settings");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await commsService.upsertAutomationConfig(config);
            showSuccess("Birthday settings saved successfully");
        } catch (error) {
            showError("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="p-6 max-w-4xl mx-auto">
                <BranchContextBanner />
            <div className="mb-8">
                <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-2">
                    <Cake className="w-6 h-6 text-pink-500" />
                    Staff Birthday Automation
                </h1>
                <p className="text-gray-500">Configure automatic birthday wishes to be sent to staff members on their special day.</p>
            </div>

            <div className="space-y-6">
                {/* Main Toggle */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${config.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Bell className={`w-6 h-6 ${config.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary">Automation Status</h3>
                                <p className="text-sm text-gray-500">Enable or disable automatic birthday wishes.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                config.isEnabled ? "bg-primary" : "bg-gray-200"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    config.isEnabled ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Configuration Details */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 transition-opacity ${!config.isEnabled && 'opacity-50 pointer-events-none'}`}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        Delivery Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Email Setting */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium text-gray-700">
                                <Mail className="w-5 h-5 text-primary" />
                                Email Template
                            </div>
                            <select
                                value={config.template?.startsWith('EMAIL:') ? config.template.split(':')[1] : ''}
                                onChange={(e) => setConfig({ ...config, template: e.target.value ? `EMAIL:${e.target.value}` : '' })}
                                className="w-full rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary"
                            >
                                <option value="">None / Disabled</option>
                                {emailTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">Select an email template tagged with 'BIRTHDAY'.</p>
                        </div>

                        {/* SMS Setting */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium text-gray-700">
                                <Smartphone className="w-5 h-5 text-primary" />
                                SMS Template
                            </div>
                            <select
                                value={config.template?.startsWith('SMS:') ? config.template.split(':')[1] : ''}
                                onChange={(e) => setConfig({ ...config, template: e.target.value ? `SMS:${e.target.value}` : '' })}
                                className="w-full rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary"
                            >
                                <option value="">None / Disabled</option>
                                {smsTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">Select an SMS template tagged with 'BIRTHDAY'.</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <strong>Note:</strong> Messages are sent daily at 8:00 AM based on the staff member's date of birth in their profile. Ensure staff DOBs are correctly recorded.
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Automation Settings
                    </button>
                </div>
            </div>
        </div>
    </RequireBranch>
    );
}

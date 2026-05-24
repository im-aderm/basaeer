'use client';

import React, { useState } from 'react';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useNotification } from '@/context/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Save,
    Settings,
    Shield,
    Bell,
    FileText,
    Key
} from 'lucide-react';

export default function SettingsPage() {
    const { showSuccess } = useNotification();
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        enableGlobalApplications: true,
        requirePaymentVerification: true,
        notifyRegistrarOnSubmit: true,
        notifyParentOnVerify: true,
        applicationPrefix: 'BSR-EVT',
        termsAndConditions: 'All applicants must behave in accordance with Islamic morals. Boarders are not allowed to bring mobile phones or other smart devices. Academic reports must be uploaded correctly.',
    });

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            showSuccess('Event module settings updated successfully');
            setSaving(false);
        }, 800);
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Event Module Settings</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Customize global registration behaviors, notification alerts, prefixes, and legal guidelines.</p>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="grid gap-6">
                    {/* General Behavior */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <Shield className="h-4.5 w-4.5 text-primary" /> Application Policies
                            </CardTitle>
                            <CardDescription>Toggle global registration availability and audit requirements.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 font-semibold text-xs text-foreground/80">
                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/10">
                                <div>
                                    <Label htmlFor="global" className="font-bold text-sm block cursor-pointer">Enable Public Registration Portal</Label>
                                    <span className="text-muted-foreground text-[10px] block font-medium mt-0.5">Allow public users to browse active events and submit registration forms.</span>
                                </div>
                                <input id="global" type="checkbox" className="h-5 w-5 accent-primary cursor-pointer shrink-0" checked={settings.enableGlobalApplications} onChange={e => setSettings({...settings, enableGlobalApplications: e.target.checked})} />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/10 border-t border-muted">
                                <div>
                                    <Label htmlFor="payPolicy" className="font-bold text-sm block cursor-pointer">Enforce Payment Verification Check</Label>
                                    <span className="text-muted-foreground text-[10px] block font-medium mt-0.5">Enforce that boarding allocations require finance approvals first.</span>
                                </div>
                                <input id="payPolicy" type="checkbox" className="h-5 w-5 accent-primary cursor-pointer shrink-0" checked={settings.requirePaymentVerification} onChange={e => setSettings({...settings, requirePaymentVerification: e.target.checked})} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email / Comms */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <Bell className="h-4.5 w-4.5 text-primary" /> Alerts & Communications
                            </CardTitle>
                            <CardDescription>Configure auto-notifications and logging parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 font-semibold text-xs text-foreground/80">
                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/10">
                                <div>
                                    <Label htmlFor="notifyReg" className="font-bold text-sm block cursor-pointer">Email Registrar on New Submission</Label>
                                    <span className="text-muted-foreground text-[10px] block font-medium mt-0.5">Send a notification when an applicant uploads documents.</span>
                                </div>
                                <input id="notifyReg" type="checkbox" className="h-5 w-5 accent-primary cursor-pointer shrink-0" checked={settings.notifyRegistrarOnSubmit} onChange={e => setSettings({...settings, notifyRegistrarOnSubmit: e.target.checked})} />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/10 border-t border-muted">
                                <div>
                                    <Label htmlFor="notifyParent" className="font-bold text-sm block cursor-pointer">Notify Parent on Receipt Verification</Label>
                                    <span className="text-muted-foreground text-[10px] block font-medium mt-0.5">Auto-email admission slips and code details upon approval.</span>
                                </div>
                                <input id="notifyParent" type="checkbox" className="h-5 w-5 accent-primary cursor-pointer shrink-0" checked={settings.notifyParentOnVerify} onChange={e => setSettings({...settings, notifyParentOnVerify: e.target.checked})} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slip custom rules */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <FileText className="h-4.5 w-4.5 text-primary" /> Registration Slips & Terms
                            </CardTitle>
                            <CardDescription>Configure prefixes and legal guidelines displayed on public forms.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="prefix" className="font-bold text-xs uppercase opacity-75">Registration Code Prefix</Label>
                                <Input id="prefix" className="h-10 rounded-xl font-bold" value={settings.applicationPrefix} onChange={e => setSettings({...settings, applicationPrefix: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="terms" className="font-bold text-xs uppercase opacity-75">Terms, Rules & Guidelines</Label>
                                <textarea id="terms" rows={4} className="w-full p-3 font-semibold text-sm rounded-xl border border-primary/20 bg-background outline-none resize-none" value={settings.termsAndConditions} onChange={e => setSettings({...settings, termsAndConditions: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Footer */}
                <div className="flex justify-end bg-card p-3 border border-primary/10 rounded-2xl shadow-sm">
                    <Button disabled={saving} onClick={handleSave} className="h-10 px-6 rounded-xl font-bold gap-1.5 shadow-lg shadow-primary/10">
                        {saving ? 'Saving...' : <>Save Configurations <Save size={16} /></>}
                    </Button>
                </div>
            </div>
        </RequireBranch>
    );
}

"use client";
import React, { useState, useEffect } from 'react';
import { Settings, Save, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AutomationEventsService, AutomationConfig } from '@/services/automationEventsService';

export default function QRSettingsPage() {
    const [configs, setConfigs] = useState<AutomationConfig[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConfigs = async () => {
        try {
            const data = await AutomationEventsService.getConfigs();
            setConfigs(data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const toggleConfig = async (type: string, currentValue: boolean) => {
        try {
            // Optimistic update
            setConfigs(prev => prev.map(c => c.type === type ? { ...c, isEnabled: !currentValue } : c));

            await AutomationEventsService.updateConfig(type, { isEnabled: !currentValue });
            toast.success('Settings updated');
        } catch (error) {
            toast.error('Failed to update settings');
            fetchConfigs(); // Revert
        }
    };

    const attendanceConfig = configs.find(c => c.type === 'ATTENDANCE_ON_ENTRY');

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">QR Settings</h1>
                    <p className="text-muted-foreground font-medium text-lg">Configure automated actions for QR scans.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-border/50">
                        <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-3">
                            <Settings className="h-8 w-8 text-primary" />
                            Automation Rules
                        </CardTitle>
                        <CardDescription className="text-lg font-medium">Control what happens when a QR code is scanned.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="attendance-entry" className="text-xl font-black italic">Auto-Mark Attendance</Label>
                                        <p className="text-muted-foreground font-medium">
                                            Automatically mark a student as "PRESENT" when they scan their ID at the entry gate.
                                        </p>
                                    </div>
                                    <Switch
                                        id="attendance-entry"
                                        checked={attendanceConfig?.isEnabled || false}
                                        onCheckedChange={() => toggleConfig('ATTENDANCE_ON_ENTRY', attendanceConfig?.isEnabled || false)}
                                        className="scale-125"
                                    />
                                </div>
                                <div className="h-px bg-border/50" />
                                <div className="flex items-center justify-between space-x-4 opacity-50 pointer-events-none">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xl font-black italic">SMS Notification (Coming Soon)</Label>
                                        <p className="text-muted-foreground font-medium">
                                            Send an SMS to parents immediately upon entry scan.
                                        </p>
                                    </div>
                                    <Switch disabled />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

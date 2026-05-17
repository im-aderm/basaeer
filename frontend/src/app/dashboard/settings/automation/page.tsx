'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Zap,
    Cake,
    Wallet,
    Bell,
    Save,
    Play,
    Clock,
    Sparkles,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { AutomationEventsService, AutomationConfig } from '@/services/automationEventsService';
import { toast } from 'sonner';

export default function AutomationPanelPage() {
    const { user, resolvedBranchId } = useAuth();
    const [configs, setConfigs] = useState<AutomationConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const data = await AutomationEventsService.getConfigs();
            setConfigs(data);
        } catch (error) {
            toast.error('Failed to load automation settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (type: string, data: Partial<AutomationConfig>) => {
        setSaving(type);
        try {
            await AutomationEventsService.updateConfig(type, data);
            toast.success(`${type.replace(/_/g, ' ')} updated successfully`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update configuration');
        } finally {
            setSaving(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'BIRTHDAY_WISH': return <Cake className="h-8 w-8 text-pink-500" />;
            case 'FEE_REMINDER': return <Wallet className="h-8 w-8 text-emerald-500" />;
            case 'ATTENDANCE_ALERT': return <Bell className="h-8 w-8 text-orange-500" />;
            default: return <Zap className="h-8 w-8 text-primary" />;
        }
    };

    const getDescription = (type: string) => {
        switch (type) {
            case 'BIRTHDAY_WISH': return 'Automatically sends warm greetings to students and staff on their birthdays.';
            case 'FEE_REMINDER': return 'Automated alerts for pending invoices based on due dates.';
            case 'ATTENDANCE_ALERT': return 'Instant notifications to parents when a student is marked absent.';
            default: return 'Configure automated campus triggers.';
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center font-semibold animate-pulse">Synchronizing Automation Hub...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Automation Hub</h1>
                    <p className="text-muted-foreground font-medium mt-1">Intelligent triggers and scheduled communication workflows.</p>
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20" onClick={() => fetchData()}>
                    <Play className="h-4 w-4" /> Run All Now
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {configs.map((config) => (
                    <Card key={config.type} className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="p-8 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center shadow-inner">
                                    {getIcon(config.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-h3 font-semibold uppercase tracking-tight">
                                            {config.type.replace(/_/g, ' ')}
                                        </CardTitle>
                                        <Badge className={`rounded-lg uppercase font-semibold text-[10px] ${config.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground opacity-50'}`}>
                                            {config.isEnabled ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="font-medium mt-1">{getDescription(config.type)}</CardDescription>
                                </div>
                            </div>
                            <Switch
                                checked={config.isEnabled}
                                onCheckedChange={(val) => handleUpdate(config.type, { isEnabled: val })}
                                className="scale-125"
                            />
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Message Template</Label>
                                    <Textarea
                                        className="min-h-[120px] rounded-2xl bg-muted/30 border-none font-medium p-4 resize-none focus:ring-primary/20"
                                        placeholder="Enter communication template..."
                                        defaultValue={config.template || ''}
                                        onBlur={(e) => handleUpdate(config.type, { template: e.target.value })}
                                    />
                                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest px-2">Use tags: {"{name}"}, {"{date}"}, {"{amount}"}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Trigger Days</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            className="h-12 w-24 rounded-xl bg-muted/30 border-none font-semibold text-center"
                                            defaultValue={config.triggerDays || 0}
                                            onBlur={(e) => handleUpdate(config.type, { triggerDays: parseInt(e.target.value) })}
                                        />
                                        <span className="text-sm font-bold opacity-60">Days before/after event</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                                        <Clock className="h-4 w-4" /> Next Run:
                                        <span className="text-primary font-semibold">Tomorrow 09:00 AM</span>
                                    </div>
                                    {saving === config.type ? (
                                        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-[3rem] border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center space-y-4 overflow-hidden relative">
                <div className="absolute -top-10 -right-10 opacity-5">
                    <Sparkles className="h-64 w-64 text-primary" />
                </div>
                <div className="h-20 w-20 rounded-[2rem] bg-background flex items-center justify-center mx-auto shadow-xl">
                    <AlertTriangle className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-h3 font-semibold">Custom Workflows?</h3>
                    <p className="text-muted-foreground font-medium max-w-lg mx-auto mt-2">
                        Advanced AI-driven automation and custom triggers can be configured per branch requirements. Contact system support for specialized logic.
                    </p>
                </div>
                <Button className="h-14 px-10 rounded-2xl font-semibold uppercase tracking-wider shadow-lg shadow-primary/20">
                    Request Custom Automation
                </Button>
            </Card>
            </div>
        </RequireBranch>
    );
}

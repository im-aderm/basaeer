'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
    Box, 
    Save, 
    GraduationCap, 
    CircleDollarSign, 
    Users, 
    Library, 
    ClipboardCheck, 
    FileText, 
    Bus, 
    Home, 
    Package, 
    PhoneCall,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Module {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    icon: any;
}

const DEFAULT_MODULES: Module[] = [
    { id: 'academics', name: 'Academics', description: 'Manage classes, sections, and school curriculum.', enabled: true, icon: GraduationCap },
    { id: 'finance', name: 'Finance', description: 'Fees collection, expenses, and financial reporting.', enabled: true, icon: CircleDollarSign },
    { id: 'hr', name: 'HR & Payroll', description: 'Employee management, attendance, and salary processing.', enabled: true, icon: Users },
    { id: 'library', name: 'Library', description: 'Book inventory, issuance, and member management.', enabled: true, icon: Library },
    { id: 'attendance', name: 'Attendance', description: 'Student and staff daily attendance tracking.', enabled: true, icon: ClipboardCheck },
    { id: 'exams', name: 'Exams', description: 'Examination scheduling and results management.', enabled: true, icon: FileText },
    { id: 'transport', name: 'Transport', description: 'Vehicle routes, tracking, and transport fees.', enabled: false, icon: Bus },
    { id: 'hostels', name: 'Hostels', description: 'Dormitory allocation and hostel management.', enabled: false, icon: Home },
    { id: 'inventory', name: 'Inventory', description: 'School assets and consumable items tracking.', enabled: false, icon: Package },
    { id: 'reception', name: 'Reception', description: 'Visitor logs, calls, and general inquiries.', enabled: true, icon: PhoneCall },
];

export default function ModulesSettingsPage() {
    const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await fetch('/api/modules');
                if (response.ok) {
                    const data = await response.json();
                    // Merge with DEFAULT_MODULES to keep icons and descriptions
                    const merged = DEFAULT_MODULES.map(m => {
                        const found = data.find((d: any) => d.id === m.id);
                        return found ? { ...m, enabled: found.enabled } : m;
                    });
                    setModules(merged);
                }
            } catch (error) {
                console.error('Failed to fetch modules:', error);
                // We keep the default modules on error
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    const handleToggle = (id: string) => {
        setModules(prev => prev.map(m => 
            m.id === id ? { ...m, enabled: !m.enabled } : m
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modules: modules.map(({ id, enabled }) => ({ id, enabled })) })
            });
            
            if (response.ok) {
                toast.success('Module configuration saved successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast.error('Failed to save module configuration');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading system modules...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">System Modules</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Enable or disable core features to customize your system.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <Card 
                            key={module.id} 
                            className={`rounded-[2rem] border-border/50 shadow-lg overflow-hidden transition-all duration-300 ${
                                module.enabled ? 'border-primary/20 bg-primary/[0.02]' : 'opacity-70 grayscale-[0.5]'
                            }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                                        module.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <Switch 
                                        checked={module.enabled}
                                        onCheckedChange={() => handleToggle(module.id)}
                                    />
                                </div>
                                <div className="mt-4 space-y-1">
                                    <h3 className="text-lg font-bold">{module.name}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {module.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

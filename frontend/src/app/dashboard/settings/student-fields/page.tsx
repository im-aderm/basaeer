"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { ListTodo, Save, Eye, EyeOff, Asterisk, Info, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SettingsService } from "@/services/settingsService";

interface StudentFieldConfig {
    id: string;
    label: string;
    category: 'Personal' | 'Academic' | 'Parent' | 'Medical';
    isVisible: boolean;
    isRequired: boolean;
}

const defaultFields: StudentFieldConfig[] = [
    { id: 'blood_group', label: 'Blood Group', category: 'Medical', isVisible: true, isRequired: false },
    { id: 'genotype', label: 'Genotype', category: 'Medical', isVisible: true, isRequired: false },
    { id: 'religion', label: 'Religion', category: 'Personal', isVisible: true, isRequired: false },
    { id: 'parent_occupation', label: 'Parent Occupation', category: 'Parent', isVisible: true, isRequired: true },
    { id: 'previous_school', label: 'Previous School Details', category: 'Academic', isVisible: true, isRequired: false },
    { id: 'disability', label: 'Disability / Special Needs', category: 'Medical', isVisible: true, isRequired: false },
    { id: 'passport_photo', label: 'Student Photo', category: 'Personal', isVisible: true, isRequired: true },
    { id: 'birth_certificate', label: 'Birth Certificate Number', category: 'Personal', isVisible: false, isRequired: false }
];

export default function StudentFieldsPage() {
    const [fields, setFields] = useState<StudentFieldConfig[]>(defaultFields);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const settings = await SettingsService.getSettings();
                const configSetting = settings.find(s => s.key === 'student_fields_config');
                if (configSetting?.value) {
                    const saved = JSON.parse(configSetting.value) as StudentFieldConfig[];
                    const merged = defaultFields.map(df => {
                        const savedField = saved.find(s => s.id === df.id);
                        return savedField ? { ...df, ...savedField } : df;
                    });
                    setFields(merged);
                }
            } catch {
                toast.error("Failed to load field configuration");
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const toggleVisible = (id: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, isVisible: !f.isVisible, isRequired: !f.isVisible ? false : f.isRequired } : f));
    };

    const toggleRequired = (id: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, isRequired: !f.isRequired } : f));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await SettingsService.updateSetting('student_fields_config', JSON.stringify(fields));
            toast.success("Student field configurations saved successfully");
        } catch {
            toast.error("Failed to save configuration");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredFields = (fields ?? []).filter(f => 
        f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['Personal', 'Academic', 'Parent', 'Medical'];

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Student Profile Fields</h1>
                    <p className="text-muted-foreground font-medium mt-1">Configure which built-in fields are visible and required on admission forms.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving || isLoading}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white/75 p-2 rounded-2xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search fields by name or category..." 
                        className="pl-12 h-12 rounded-xl border-none bg-transparent focus-visible:ring-0 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-10">
                {categories.map(category => {
                    const categoryFields = filteredFields.filter(f => f.category === category);
                    if (categoryFields.length === 0) return null;

                    return (
                        <section key={category} className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <h2 className="text-xl font-bold tracking-tight">{category} Information</h2>
                                <Badge variant="outline" className="rounded-full">{categoryFields.length}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryFields.map(field => (
                                    <Card key={field.id} className={`rounded-3xl border-border/50 transition-all ${!field.isVisible ? 'opacity-60 bg-muted/20' : 'shadow-md hover:shadow-lg'}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${field.isVisible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                        {field.isVisible ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{field.label}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold">{field.category}</Badge>
                                                            {field.isRequired && (
                                                                <span className="text-destructive flex items-center text-[10px] font-bold uppercase tracking-wider">
                                                                    <Asterisk className="h-3 w-3" />
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4 border-l border-border/50 pl-6">
                                                    <div className="flex items-center justify-between gap-8">
                                                        <Label htmlFor={`visible-${field.id}`} className="text-sm font-semibold cursor-pointer">Visible</Label>
                                                        <Switch 
                                                            id={`visible-${field.id}`} 
                                                            checked={field.isVisible} 
                                                            onCheckedChange={() => toggleVisible(field.id)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between gap-8">
                                                        <Label htmlFor={`required-${field.id}`} className="text-sm font-semibold cursor-pointer">Required</Label>
                                                        <Switch 
                                                            id={`required-${field.id}`} 
                                                            checked={field.isRequired} 
                                                            onCheckedChange={() => toggleRequired(field.id)}
                                                            disabled={!field.isVisible}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-8 flex gap-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <Info className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-bold text-blue-900">Form Configuration Guide</h4>
                    <p className="text-blue-700 leading-relaxed font-medium">
                        These settings directly affect the Online Admission form and the Administrative Student Creation forms. 
                        Hidden fields will not be rendered at all, while optional fields will be marked with "(Optional)" and won't block submission.
                    </p>
                </div>
            </div>
            </div>
        </RequireBranch>
    );
}

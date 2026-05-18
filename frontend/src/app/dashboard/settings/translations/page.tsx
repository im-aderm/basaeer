'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Languages, 
    Save, 
    Plus, 
    Trash2, 
    Search,
    Loader2,
    Globe
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface Translation {
    key: string;
    value: string;
}

const LOCALES = [
    { label: 'English (US)', value: 'en' },
    { label: 'Arabic (العربية)', value: 'ar' },
    { label: 'French (Français)', value: 'fr' },
    { label: 'Spanish (Español)', value: 'es' },
];

const DEFAULT_TRANSLATIONS: Record<string, Translation[]> = {
    'en': [
        { key: 'common.save', value: 'Save' },
        { key: 'common.cancel', value: 'Cancel' },
        { key: 'dashboard.welcome', value: 'Welcome back' },
    ],
    'ar': [
        { key: 'common.save', value: 'حفظ' },
        { key: 'common.cancel', value: 'إلغاء' },
        { key: 'dashboard.welcome', value: 'مرحباً بك مجدداً' },
    ]
};

export default function TranslationsPage() {
    const { showSuccess, showError } = useNotification();
    const [locale, setLocale] = useState('en');
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchTranslations = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/translations?locale=${locale}`);
                if (response.ok) {
                    const data = await response.json();
                    setTranslations(data.translations || []);
                } else {
                    // Fallback to defaults
                    setTranslations(DEFAULT_TRANSLATIONS[locale] || []);
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch translations:', error);
                setTranslations(DEFAULT_TRANSLATIONS[locale] || []);
            } finally {
                setLoading(false);
            }
        };
        fetchTranslations();
    }, [locale]);

    const handleUpdate = (index: number, value: string) => {
        setTranslations(prev => {
            const next = [...prev];
            next[index] = { ...next[index], value };
            return next;
        });
    };

    const handleAdd = () => {
        setTranslations(prev => [...prev, { key: '', value: '' }]);
    };

    const handleRemove = (index: number) => {
        setTranslations(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale, translations })
            });
            
            if (response.ok) {
                showSuccess('Translations updated successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            showError('Failed to update translations');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTranslations = (translations ?? []).filter(t => 
        t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Translations</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Manage system-wide text and multi-language support.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={locale} onValueChange={setLocale}>
                        <SelectTrigger className="w-[180px] h-12 rounded-2xl font-bold">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCALES.map(l => (
                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-t-blue-500/20">
                <CardHeader className="bg-blue-500/5 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Languages className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 font-semibold">Language Editor</CardTitle>
                                <CardDescription className="font-medium">Edit translation keys for {LOCALES.find(l => l.value === locale)?.label}.</CardDescription>
                            </div>
                        </div>
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search keys or text..."
                                className="pl-9 h-11 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">Fetching translations...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                <div className="col-span-5">Key Identifier</div>
                                <div className="col-span-6">Translation Text</div>
                                <div className="col-span-1"></div>
                            </div>
                            
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredTranslations.map((t, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-muted/30 p-2 rounded-2xl border border-transparent hover:transition-colors">
                                        <div className="col-span-5">
                                            <Input 
                                                value={t.key} 
                                                readOnly 
                                                className="h-11 rounded-xl border-none bg-transparent font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <Input 
                                                value={t.value} 
                                                onChange={(e) => handleUpdate(translations.indexOf(t), e.target.value)}
                                                className="h-11 rounded-xl bg-background font-medium"
                                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                onClick={() => handleRemove(translations.indexOf(t))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                
                                {filteredTranslations.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground font-medium">
                                        No translations found matching your search.
                                    </div>
                                )}
                            </div>

                            <Button 
                                variant="outline" 
                                className="w-full mt-6 h-12 rounded-2xl border-dashed border-2 hover:bg-muted/50 font-semibold gap-2"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4" />
                                Add New Translation Key
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </RequireBranch>
    );
}

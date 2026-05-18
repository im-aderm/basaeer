'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { AttachmentService, AttachmentCategory } from '@/services/attachmentService';
import { ClassService, Class } from '@/services/classService';
import { useNotification } from '@/context/NotificationContext';

export default function AttachmentUploadPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [categories, setCategories] = useState<AttachmentCategory[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        classIds: new Set<string>(),
        sectionIds: new Set<string>(),
    });

    useEffect(() => {
        const init = async () => {
            if (!resolvedBranchId) { setLoading(false); return; }
            try {
                const [cats, cls] = await Promise.all([
                    AttachmentService.getCategories(resolvedBranchId),
                    ClassService.getAll(resolvedBranchId),
                ]);
                setCategories(cats);
                setClasses(cls);
            } catch (error) {
                showError('Failed to load form data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [resolvedBranchId]);

    const toggleClass = (classId: string) => {
        const next = new Set(formData.classIds);
        if (next.has(classId)) next.delete(classId);
        else next.add(classId);
        setFormData({ ...formData, classIds: next });
    };

    const toggleSection = (sectionId: string) => {
        const next = new Set(formData.sectionIds);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        setFormData({ ...formData, sectionIds: next });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !formData.title || !formData.categoryId) {
            showError('Title, category, and file are required');
            return;
        }
        setSubmitting(true);
        try {
            await AttachmentService.upload(file, {
                title: formData.title,
                categoryId: formData.categoryId,
                classIds: Array.from(formData.classIds),
                sectionIds: Array.from(formData.sectionIds),
            });
            showSuccess('File uploaded successfully');
            setFormData({ title: '', categoryId: '', classIds: new Set(), sectionIds: new Set() });
            setFile(null);
        } catch (error) {
            showError('Upload failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-h1 font-bold tracking-tight text-primary">Upload Digital Content</h1>
                <p className="text-muted-foreground font-medium mt-1">Share resources with classes and sections.</p>
            </div>

            <Card className="rounded-[2rem] shadow-2xl shadow-primary/5 border-border/50 overflow-hidden">
                <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        New Upload
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
                            <Input
                                required
                                placeholder="e.g. Algebra Worksheet Week 3"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-14 rounded-2xl font-bold text-lg"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                            >
                                <SelectTrigger className="h-14 rounded-2xl font-bold text-lg px-5">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id} className="font-bold py-3">
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Classes & Sections</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleClass(cls.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                                formData.classIds.has(cls.id)
                                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                                    : 'bg-muted/50 hover:bg-muted'
                                            }`}
                                        >
                                            {cls.name}
                                        </button>
                                        {formData.classIds.has(cls.id) && cls.sections?.length > 0 && (
                                            <div className="pl-2 space-y-1">
                                                {cls.sections.map((sec) => (
                                                    <button
                                                        key={sec.id}
                                                        type="button"
                                                        onClick={() => toggleSection(sec.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                            formData.sectionIds.has(sec.id)
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-muted/30 hover:bg-muted'
                                                        }`}
                                                    >
                                                        {sec.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">File</Label>
                            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                                {file ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div className="text-left">
                                            <p className="font-bold">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="rounded-xl">
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                        <p className="font-semibold text-muted-foreground">
                                            Drop a file here or <span className="text-primary underline">browse</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, images, Word, Excel up to 5MB</p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xlsx"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] gap-2"
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                            {submitting ? 'Uploading...' : 'Upload Resource'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

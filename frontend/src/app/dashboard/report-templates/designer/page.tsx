'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { reportTemplateService, ReportTemplate } from '@/services/reportTemplateService';
import {
    Save,
    ArrowLeft,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

const REPORT_TYPES = [
    { value: 'STUDENT_REPORT', label: 'Termly Report Card' },
    { value: 'ANNUAL_CUMULATIVE', label: 'Annual Cumulative Report' },
];

const DEFAULT_TEMPLATE: Partial<ReportTemplate> = {
    name: 'New Template',
    type: 'STUDENT_REPORT',
    layout: { html: '<h1>{{studentName}}</h1>\n<p>Start building your report layout here — this is compiled with Handlebars, so {{fields}}, {{#if conditions}} and {{#each loops}} all work exactly as they will on the real generated PDF.</p>' },
    config: {
        paperSize: 'A4',
        landscape: false,
        showWatermark: true,
        showLogo: true,
        showQrCode: true,
    },
    isDefault: false,
};

export default function TemplateDesignerPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showSuccess, showError } = useNotification();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewError, setPreviewError] = useState('');
    const [template, setTemplate] = useState<Partial<ReportTemplate>>(DEFAULT_TEMPLATE);

    useEffect(() => {
        if (id) {
            loadTemplate();
        }
    }, [id]);

    const loadTemplate = async () => {
        try {
            const data = await reportTemplateService.getTemplateById(id!);
            setTemplate(data);
        } catch (error) {
            showError('Failed to load template');
            router.push('/dashboard/report-templates');
        } finally {
            setLoading(false);
        }
    };

    const runPreview = useCallback(async () => {
        setPreviewing(true);
        setPreviewError('');
        try {
            const html = await reportTemplateService.preview(template.type!, template.layout);
            setPreviewHtml(html);
        } catch (error: any) {
            setPreviewError(error?.response?.data?.message || 'Failed to render preview');
        } finally {
            setPreviewing(false);
        }
    }, [template.type, template.layout]);

    // Render an initial preview on load and whenever the template type changes
    // (a fresh sample-data shape) — otherwise the admin edits the preview
    // explicitly via the Refresh button rather than on every keystroke, which
    // would hammer the render endpoint while typing.
    useEffect(() => {
        if (!loading) runPreview();
    }, [loading, template.type, runPreview]);

    const handleSave = async () => {
        try {
            setSaving(true);
            if (id) {
                await reportTemplateService.updateTemplate(id, template);
                showSuccess('Template updated');
            } else {
                await reportTemplateService.createTemplate(template);
                showSuccess('Template created');
                router.push('/dashboard/report-templates');
            }
        } catch (error) {
            showError('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (key: string, value: any) => {
        setTemplate({ ...template, config: { ...template.config, [key]: value } });
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="h-full flex flex-col">
            <BranchContextBanner />
            <header className="p-4 bg-white border-b border-primary/60 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <input
                            value={template.name}
                            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                            className="bg-transparent border-none focus:ring-0 text-xl font-bold p-0"
                            placeholder="Template Name"
                        />
                        <p className="text-xs text-gray-500">Editing report template</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!template.isDefault}
                            onChange={(e) => setTemplate({ ...template, isDefault: e.target.checked })}
                        />
                        Use as branch default
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Template
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Settings sidebar */}
                <div className="w-64 bg-gray-50 border-r border-primary/60 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Report Type</label>
                        <select
                            className="w-full text-sm bg-white border border-primary/90 rounded-lg p-2"
                            value={template.type}
                            onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                        >
                            {REPORT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-primary/60">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Page Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Paper Size</label>
                                <select
                                    className="w-full text-sm bg-white border border-primary/90 rounded-lg p-2"
                                    value={template.config?.paperSize || 'A4'}
                                    onChange={(e) => updateConfig('paperSize', e.target.value)}
                                >
                                    <option value="A4">A4 Standard</option>
                                    <option value="Letter">US Letter</option>
                                    <option value="Legal">Legal</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={!!template.config?.landscape}
                                    onChange={(e) => updateConfig('landscape', e.target.checked)}
                                />
                                Landscape orientation
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={template.config?.showLogo !== false}
                                    onChange={(e) => updateConfig('showLogo', e.target.checked)}
                                />
                                Show school logo
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={template.config?.showWatermark !== false}
                                    onChange={(e) => updateConfig('showWatermark', e.target.checked)}
                                />
                                Show watermark
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={template.config?.showQrCode !== false}
                                    onChange={(e) => updateConfig('showQrCode', e.target.checked)}
                                />
                                Show verification QR code
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-primary/60 text-xs text-gray-500 space-y-2">
                        <p>The layout is HTML compiled with Handlebars — the same fields your report data provides (student name, subjects, behavioural ratings, etc.) are available as <code>{'{{placeholders}}'}</code>.</p>
                    </div>
                </div>

                {/* Editor + Preview */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 flex flex-col border-r border-primary/60">
                        <div className="px-4 py-2 bg-gray-50 border-b border-primary/60 text-xs font-bold uppercase tracking-wider text-primary">
                            HTML Template Source
                        </div>
                        <textarea
                            value={template.layout?.html || ''}
                            onChange={(e) => setTemplate({ ...template, layout: { ...template.layout, html: e.target.value } })}
                            className="flex-1 w-full p-4 font-mono text-xs bg-white border-none focus:ring-0 resize-none"
                            spellCheck={false}
                        />
                    </div>
                    <div className="w-1/2 flex flex-col">
                        <div className="px-4 py-2 bg-gray-50 border-b border-primary/60 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Preview (sample data)</span>
                            <button
                                onClick={runPreview}
                                disabled={previewing}
                                className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-primary/60 rounded-lg hover:border-blue-500 disabled:opacity-50"
                            >
                                {previewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Refresh
                            </button>
                        </div>
                        {previewError ? (
                            <div className="flex-1 flex items-center justify-center p-8 text-sm text-red-600 text-center">{previewError}</div>
                        ) : (
                            <iframe
                                title="Template preview"
                                srcDoc={previewHtml}
                                className="flex-1 w-full bg-gray-200"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}

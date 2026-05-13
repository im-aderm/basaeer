'use client';

import { useState, useEffect } from 'react';
import { reportTemplateService, ReportTemplate } from '@/services/reportTemplateService';
import {
    Plus,
    Layout,
    FileText,
    Settings,
    Eye,
    Trash2,
    Copy,
    CheckCircle,
    MoreVertical,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ReportTemplatesPage() {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await reportTemplateService.getTemplates();
            setTemplates(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load templates:', error);
            toast.error('Failed to load report templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this template?')) return;
        try {
            await reportTemplateService.deleteTemplate(id);
            toast.success('Template deactivated');
            loadTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold text-gray-900">Report Templates</h1>
                    <p className="text-gray-600 mt-1">
                        Design and manage custom layouts for report cards and transcripts
                    </p>
                </div>
                <Link
                    href="/dashboard/report-templates/designer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Template
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            ) : templates.length === 0 ? (
                <div className="bg-white rounded-xl p-20 text-center border border-dashed border-gray-200">
                    <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No templates yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                        Create your first custom report card template to start issuing professional academic records.
                    </p>
                    <Link
                        href="/dashboard/report-templates/designer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mt-8 shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Get Started
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-[4/3] bg-gray-100 relative flex items-center justify-center border-b border-gray-200 overflow-hidden">
                                <FileText className="w-16 h-16 text-gray-300" />
                                {template.isDefault && (
                                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                        <CheckCircle className="w-3 h-3" />
                                        DEFAULT
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Link
                                        href={`/dashboard/report-templates/designer?id=${template.id}`}
                                        className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                                        title="Edit Template"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={`/dashboard/report-templates/preview?id=${template.id}`}
                                        className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                                        title="Preview"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 truncate">{template.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{template.type.toLowerCase().replace('_', ' ')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 italic">Last updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                                    <button className="text-xs font-semibold text-blue-600 hover:underline">Duplicate</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

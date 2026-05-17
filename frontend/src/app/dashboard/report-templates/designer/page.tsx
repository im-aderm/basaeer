'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { reportTemplateService, ReportTemplate } from '@/services/reportTemplateService';
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Settings,
    FileText,
    Loader2,
    Layout
} from 'lucide-react';
import { toast } from 'sonner';

export default function TemplateDesignerPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [template, setTemplate] = useState<Partial<ReportTemplate>>({
        name: 'New Template',
        type: 'STUDENT_REPORT',
        layout: {
            sections: [
                { type: 'HEADER', order: 0 },
                { type: 'TABLE', title: 'Academic Performance', dataType: 'ACADEMIC_RESULTS', order: 1 },
                { type: 'SIGNATURES', order: 2 }
            ]
        },
        config: {
            margins: 50,
            paperSize: 'A4',
            watermark: ''
        }
    });

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
            toast.error('Failed to load template');
            router.push('/dashboard/report-templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (id) {
                await reportTemplateService.updateTemplate(id, template);
                toast.success('Template updated');
            } else {
                await reportTemplateService.createTemplate(template);
                toast.success('Template created');
                router.push('/dashboard/report-templates');
            }
        } catch (error) {
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const addSection = (type: string) => {
        const sections = [...(template.layout.sections || [])];
        sections.push({
            type,
            title: type === 'TEXT' ? 'Remarks' : 'New Section',
            order: sections.length,
            content: type === 'TEXT' ? 'Student remarks go here...' : ''
        });
        setTemplate({ ...template, layout: { ...template.layout, sections } });
    };

    const removeSection = (index: number) => {
        const sections = [...(template.layout.sections || [])];
        sections.splice(index, 1);
        setTemplate({ ...template, layout: { ...template.layout, sections } });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const sections = [...(template.layout.sections || [])];
        if (direction === 'up' && index > 0) {
            [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
        } else if (direction === 'down' && index < sections.length - 1) {
            [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        }
        setTemplate({ ...template, layout: { ...template.layout, sections } });
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
                        <p className="text-xs text-gray-500">Editing Layout</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
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
                {/* Elements Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-primary/60 p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Add Elements</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <ElementButton icon={<FileText className="w-4 h-4" />} label="Header" onClick={() => addSection('HEADER')} />
                            <ElementButton icon={<Layout className="w-4 h-4" />} label="Data Table" onClick={() => addSection('TABLE')} />
                            <ElementButton icon={<FileText className="w-4 h-4" />} label="Text Block" onClick={() => addSection('TEXT')} />
                            <ElementButton icon={<Settings className="w-4 h-4" />} label="Signatures" onClick={() => addSection('SIGNATURES')} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-primary/60">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Page Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Paper Size</label>
                                <select 
                                    className="w-full text-sm bg-white border border-primary/90 rounded-lg"
                                    value={template.config.paperSize}
                                    onChange={(e) => setTemplate({...template, config: {...template.config, paperSize: e.target.value}})}
                                >
                                    <option value="A4">A4 Standard</option>
                                    <option value="LETTER">US Letter</option>
                                    <option value="LEGAL">Legal</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Margins (px)</label>
                                <input 
                                    type="number"
                                    className="w-full text-sm bg-white border border-primary/90 rounded-lg"
                                    value={template.config.margins}
                                    onChange={(e) => setTemplate({...template, config: {...template.config, margins: parseInt(e.target.value)}})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-gray-200 p-8 overflow-auto">
                    <div className="max-w-[800px] mx-auto bg-white shadow-2xl min-h-[1100px] p-[50px] space-y-8">
                        {template.layout.sections.map((section: any, idx: number) => (
                            <div key={idx} className="group relative border-2 border-transparent hover:border-blue-500/50 hover:bg-blue-50/5 p-4 rounded-xl transition-all">
                                <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveSection(idx, 'up')} className="p-2 bg-white shadow-md rounded-lg hover:text-blue-500"><MoveUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveSection(idx, 'down')} className="p-2 bg-white shadow-md rounded-lg hover:text-blue-500"><MoveDown className="w-4 h-4" /></button>
                                    <button onClick={() => removeSection(idx)} className="p-2 bg-white shadow-md rounded-lg hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>

                                {section.type === 'HEADER' && (
                                    <div className="text-center space-y-2 py-4 border-b-2 border-gray-100">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                                            <Layout className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Institution Name</h2>
                                        <p className="text-sm text-gray-500">Street Address, City, Country</p>
                                    </div>
                                )}

                                {section.type === 'TABLE' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-l-4 border-blue-500 pl-3">{section.title}</h3>
                                        <div className="grid grid-cols-5 bg-gray-100 p-2 rounded-lg font-bold text-xs">
                                            <span>Subject</span>
                                            <span>Test 1</span>
                                            <span>Test 2</span>
                                            <span>Exam</span>
                                            <span>Total</span>
                                        </div>
                                        <div className="space-y-2 opacity-30">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="grid grid-cols-5 p-2 text-xs border-b border-gray-100">
                                                    <span>Mathematics</span>
                                                    <span>15</span>
                                                    <span>18</span>
                                                    <span>52</span>
                                                    <span className="font-bold">85</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {section.type === 'TEXT' && (
                                    <div className="space-y-2">
                                        <input 
                                            value={section.title}
                                            onChange={(e) => {
                                                const sections = [...template.layout.sections];
                                                sections[idx].title = e.target.value;
                                                setTemplate({...template, layout: {...template.layout, sections}});
                                            }}
                                            className="text-lg font-bold bg-transparent border-none p-0 focus:ring-0"
                                        />
                                        <textarea 
                                            value={section.content}
                                            onChange={(e) => {
                                                const sections = [...template.layout.sections];
                                                sections[idx].content = e.target.value;
                                                setTemplate({...template, layout: {...template.layout, sections}});
                                            }}
                                            className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 text-gray-600 min-h-[80px]"
                                        />
                                    </div>
                                )}

                                {section.type === 'SIGNATURES' && (
                                    <div className="flex items-center justify-between pt-12">
                                        <div className="text-center">
                                            <div className="w-48 border-b-2 border-gray-900 mb-2" />
                                            <p className="text-sm font-bold">Class Teacher</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-48 border-b-2 border-gray-900 mb-2" />
                                            <p className="text-sm font-bold">Principal</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-primary/60 rounded-2xl group-hover:border-blue-500/50 transition-colors">
                            <p className="text-sm text-gray-400">End of Report Card</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}

function ElementButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-3 bg-white border border-primary/60 rounded-xl text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
        >
            {icon}
            {label}
        </button>
    );
}

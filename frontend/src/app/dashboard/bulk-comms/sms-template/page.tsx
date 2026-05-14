"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Edit2, Trash2, Save, X, Search, Smartphone } from "lucide-react";
import { commsService, SmsTemplate } from "@/services/commsService";
import { toast } from "sonner";

export default function SmsTemplatesPage() {
    const [templates, setTemplates] = useState<SmsTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<SmsTemplate>>({
        name: "",
        content: "",
        type: "GENERAL"
    });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await commsService.getSmsTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error("Failed to load SMS templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentTemplate.id) {
                await commsService.updateSmsTemplate(currentTemplate.id, currentTemplate);
                toast.success("Template updated successfully");
            } else {
                await commsService.createSmsTemplate(currentTemplate);
                toast.success("Template created successfully");
            }
            setIsEditing(false);
            setCurrentTemplate({ name: "", content: "", type: "GENERAL" });
            fetchTemplates();
        } catch (error) {
            toast.error("Failed to save template");
        }
    };

    const editTemplate = (template: SmsTemplate) => {
        setCurrentTemplate(template);
        setIsEditing(true);
    };

    const filteredTemplates = (templates ?? []).filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        SMS Templates
                    </h1>
                    <p className="text-gray-500">Create and manage short message templates for your campaigns.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setCurrentTemplate({ name: "", content: "", type: "GENERAL" });
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Template
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">{currentTemplate.id ? "Edit SMS Template" : "New SMS Template"}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <input
                                type="text"
                                value={currentTemplate.name}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="e.g., Birthday SMS"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                            <select
                                value={currentTemplate.type}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, type: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary px-3 py-2"
                            >
                                <option value="GENERAL">General</option>
                                <option value="BIRTHDAY">Birthday</option>
                                <option value="ADMISSION">Admission</option>
                                <option value="FEE_REMINDER">Fee Reminder</option>
                                <option value="EXAM">Exam</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Content</label>
                            <textarea
                                value={currentTemplate.content}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, content: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary px-3 py-2 h-40"
                                placeholder="Write your SMS content here. Use {firstName}, {lastName} for personalization."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {currentTemplate.content?.length || 0} characters. (160 characters = 1 SMS)
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                <Save className="w-4 h-4" />
                                Save Template
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search SMS templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-200 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                            <p>Loading SMS templates...</p>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => (
                                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-primary/5 rounded-lg">
                                            <Smartphone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => editTemplate(template)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 truncate">{template.name}</h3>
                                    <div className="bg-gray-50 p-3 rounded-lg mb-4 h-24 overflow-hidden">
                                        <p className="text-sm text-gray-600 line-clamp-3 italic">"{template.content}"</p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{template.type}</span>
                                        <span>{template.content.length} chars</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No SMS templates</h3>
                            <p className="text-gray-500 mb-6">Create templates to quickly send SMS notifications.</p>
                            <button
                                onClick={() => {
                                    setCurrentTemplate({ name: "", content: "", type: "GENERAL" });
                                    setIsEditing(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" />
                                Create New SMS Template
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

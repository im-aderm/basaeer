"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, Edit2, Trash2, Save, X, Search, FileText } from "lucide-react";
import { commsService, EmailTemplate } from "@/services/commsService";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<EmailTemplate>>({
        name: "",
        subject: "",
        body: "",
        type: "GENERAL"
    });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await commsService.getEmailTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error("Failed to load email templates");
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
                await commsService.updateEmailTemplate(currentTemplate.id, currentTemplate);
                toast.success("Template updated successfully");
            } else {
                await commsService.createEmailTemplate(currentTemplate);
                toast.success("Template created successfully");
            }
            setIsEditing(false);
            setCurrentTemplate({ name: "", subject: "", body: "", type: "GENERAL" });
            fetchTemplates();
        } catch (error) {
            toast.error("Failed to save template");
        }
    };

    const editTemplate = (template: EmailTemplate) => {
        setCurrentTemplate(template);
        setIsEditing(true);
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="w-6 h-6 text-primary" />
                        Email Templates
                    </h1>
                    <p className="text-gray-500">Create and manage reusable email templates for your campaigns.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setCurrentTemplate({ name: "", subject: "", body: "", type: "GENERAL" });
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">{currentTemplate.id ? "Edit Template" : "New Template"}</h2>
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
                                placeholder="e.g., Welcome Email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                            <input
                                type="text"
                                value={currentTemplate.subject}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="e.g., Welcome to our school!"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                            <textarea
                                value={currentTemplate.body}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary px-3 py-2 h-64"
                                placeholder="Write your email content here. Use {firstName}, {lastName} for personalization."
                                required
                            />
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
                            placeholder="Search templates by name or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-200 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                            <p>Loading templates...</p>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => (
                                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-primary/5 rounded-lg">
                                            <FileText className="w-6 h-6 text-primary" />
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
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{template.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">{template.subject}</p>
                                    <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-50">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{template.type}</span>
                                        <span className="text-gray-400">Modified: {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
                            <p className="text-gray-500 mb-6">Start by creating your first email template.</p>
                            <button
                                onClick={() => {
                                    setCurrentTemplate({ name: "", subject: "", body: "", type: "GENERAL" });
                                    setIsEditing(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" />
                                Create New Template
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

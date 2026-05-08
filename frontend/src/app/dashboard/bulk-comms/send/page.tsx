"use client";

import { useState, useEffect } from "react";
import { Send, Mail, MessageSquare, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { commsService, EmailTemplate, SmsTemplate } from "@/services/commsService";
import { toast } from "sonner";

export default function SendCommsPage() {
    const [type, setType] = useState<"EMAIL" | "SMS">("EMAIL");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [recipientGroup, setRecipientGroup] = useState("ALL_STUDENTS");
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<{ email: EmailTemplate[], sms: SmsTemplate[] }>({ email: [], sms: [] });

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const [emailRes, smsRes] = await Promise.all([
                    commsService.getEmailTemplates(),
                    commsService.getSmsTemplates()
                ]);
                setTemplates({ email: emailRes.data, sms: smsRes.data });
            } catch (error) {
                console.error("Failed to fetch templates", error);
            }
        };
        fetchTemplates();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || (type === "EMAIL" && !subject)) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            if (type === "EMAIL") {
                await commsService.sendBulkEmail({ subject, message, recipientGroup });
            } else {
                await commsService.sendBulkSms({ message, recipientGroup });
            }
            toast.success(`${type} Campaign started successfully`);
            setSubject("");
            setMessage("");
        } catch (error) {
            toast.error(`Failed to send ${type} campaign`);
        } finally {
            setLoading(false);
        }
    };

    const applyTemplate = (templateBody: string, templateSubject?: string) => {
        setMessage(templateBody);
        if (templateSubject) setSubject(templateSubject);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Send className="w-6 h-6 text-primary" />
                    Send Bulk Communication
                </h1>
                <p className="text-gray-500">Send mass email or SMS to students, staff, or parents.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => setType("EMAIL")}
                        className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 transition-colors ${
                            type === "EMAIL" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <Mail className="w-5 h-5" />
                        Email Campaign
                    </button>
                    <button
                        onClick={() => setType("SMS")}
                        className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 transition-colors ${
                            type === "SMS" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        SMS Campaign
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Recipient Group
                            </label>
                            <select
                                value={recipientGroup}
                                onChange={(e) => setRecipientGroup(e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 px-3"
                            >
                                <option value="ALL_STUDENTS">All Students</option>
                                <option value="ALL_STAFF">All Staff</option>
                                <option value="PARENTS">Parents / Guardians</option>
                                <option value="ALUMNI">Alumni</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick Templates
                            </label>
                            <select
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    if (type === "EMAIL") {
                                        const t = templates.email.find(x => x.id === val);
                                        if (t) applyTemplate(t.body, t.subject);
                                    } else {
                                        const t = templates.sms.find(x => x.id === val);
                                        if (t) applyTemplate(t.content);
                                    }
                                }}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 px-3"
                            >
                                <option value="">Select a template...</option>
                                {type === "EMAIL" 
                                    ? templates.email.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                    : templates.sms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    {type === "EMAIL" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 px-3"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Body
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder={`Enter your ${type.toLowerCase()} message here...`}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {type === "SMS" && `${message.length} characters used. 1 SMS = 160 characters.`}
                        </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            Sending to many recipients may take a few minutes.
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Campaign
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Variables
                    </h3>
                    <p className="text-sm text-blue-700">Use {'{firstName}'}, {'{lastName}'} to personalize messages.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Templates
                    </h3>
                    <p className="text-sm text-green-700">Save frequent messages as templates for quick access.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Scheduling
                    </h3>
                    <p className="text-sm text-purple-700">Campaigns are processed in the background.</p>
                </div>
            </div>
        </div>
    );
}

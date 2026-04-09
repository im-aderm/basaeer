"use client";
import React, { useState } from 'react';
import { Send, Users, Mail, MessageSquare, History, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';

export default function BulkCommsPage() {
    const [mode, setMode] = useState<'SMS' | 'EMAIL'>('EMAIL');
    const [recipientGroup, setRecipientGroup] = useState('ALL_PARENTS');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        if (!message) {
            toast.error("Message content cannot be empty.");
            return;
        }
        setIsSending(true);
        // Mock send delay
        setTimeout(() => {
            setIsSending(false);
            toast.success(`Bulk ${mode} scheduled successfully for ${recipientGroup}`);
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-h1 font-semibold tracking-tight uppercase">Bulk Communications</h1>
                <p className="text-muted-foreground font-medium mt-1">Broadcast important notices to parents, students, and staff via SMS and Email.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Composer Section */}
                <Card className="lg:col-span-2 rounded-[3rem] border-border/50 shadow-xl overflow-hidden bg-background">
                    <CardHeader className="p-8 border-b border-border/50 bg-muted/10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                                {mode === 'EMAIL' ? <Mail className="text-primary w-6 h-6" /> : <MessageSquare className="text-primary w-6 h-6" />}
                                Composer
                            </CardTitle>
                            <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-xl px-6 font-semibold transition-all ${mode === 'EMAIL' ? 'bg-background shadow-sm text-primary' : 'opacity-60 text-muted-foreground'}`}
                                    onClick={() => setMode('EMAIL')}
                                >
                                    Email
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-xl px-6 font-semibold transition-all ${mode === 'SMS' ? 'bg-background shadow-sm text-primary' : 'opacity-60 text-muted-foreground'}`}
                                    onClick={() => setMode('SMS')}
                                >
                                    SMS
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Target Audience</label>
                                <select 
                                    className="flex h-14 w-full rounded-2xl border border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-medium"
                                    value={recipientGroup}
                                    onChange={(e) => setRecipientGroup(e.target.value)}
                                >
                                    <option value="ALL_PARENTS">All Parents (Active Students)</option>
                                    <option value="ALL_STAFF">All Academic Staff</option>
                                    <option value="JSS_PARENTS">Junior Secondary Parents</option>
                                    <option value="SSS_PARENTS">Senior Secondary Parents</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Quick Templates</label>
                                <select className="flex h-14 w-full rounded-2xl border border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-medium">
                                    <option value="">Start from scratch...</option>
                                    <option value="fee_reminder">Tuition Fee Reminder</option>
                                    <option value="holiday_greeting">Holiday/Eid Greeting</option>
                                    <option value="pta_meeting">Upcoming PTA Meeting</option>
                                </select>
                            </div>
                        </div>

                        {mode === 'EMAIL' && (
                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Subject Line</label>
                                <input 
                                    className="flex h-14 w-full rounded-2xl border border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" 
                                    placeholder="e.g. End of Term Arrangements" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Message Body</label>
                                {mode === 'SMS' && <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-lg">{message.length}/160 chars</span>}
                            </div>
                            <textarea 
                                className="flex min-h-[250px] w-full rounded-2xl border border-input bg-transparent px-4 py-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y" 
                                placeholder="Type your message here. Use {FirstName} to dynamically inject parent names..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground max-w-xs">
                                Broadcasts are queued within 5 minutes. Estimated recipients: <span className="font-bold text-primary">~450</span>
                            </p>
                            <Button 
                                onClick={handleSend} 
                                disabled={isSending}
                                className="h-14 px-8 rounded-2xl font-semibold gap-2 shadow-lg hover:scale-105 transition-all text-base tracking-wide"
                            >
                                {isSending ? 'Queuing Broadcast...' : (
                                    <>
                                        <Send size={18} /> Broadcast Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History & Quota Section */}
                <div className="space-y-8 h-full">
                    {/* Status Card */}
                    <Card className="rounded-[2.5rem] border-none bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-white/70" /> Account Quotas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-white/70">SMS Balance</span>
                                    <span className="font-bold">12,450 units</span>
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[60%] rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-white/70">Daily Email Limit</span>
                                    <span className="font-bold">450 / 2,000</span>
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[22%] rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Feed */}
                    <Card className="rounded-[2.5rem] border-border/50 shadow-lg flex-1 min-h-[400px]">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-h3 font-semibold flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" /> Recent Broadcasts
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="h-[300px]">
                            <div className="p-6 space-y-4">
                                {[
                                    { title: 'Eid-ul-Fitr Break Notice', type: 'SMS', date: 'Today, 09:00 AM', status: 'Delivered', reach: '521' },
                                    { title: 'Term 2 Fee Reminder', type: 'EMAIL', date: 'Yesterday, 14:30', status: 'Queued', reach: '105' },
                                    { title: 'PTA General Assembly', type: 'EMAIL', date: 'Mar 15, 2026', status: 'Delivered', reach: '680' },
                                ].map((item, id) => (
                                    <div key={id} className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-default">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex gap-2 items-center">
                                                    {item.type === 'SMS' ? <MessageSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                                    {item.date}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`font-bold border-none text-[10px] ${item.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </div>
    );
}

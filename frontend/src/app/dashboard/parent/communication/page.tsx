'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    Send,
    MessageSquare,
    User,
    Search,
    Check,
    CheckCheck,
    Clock,
    Plus,
    MoreVertical,
    Phone,
    Video
} from 'lucide-react';
import { StakeholderService, Conversation, Message } from '@/services/stakeholderService';
import { toast } from 'sonner';

export default function CommunicationPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            const data = await StakeholderService.getConversations();
            setConversations(data);
            if (data.length > 0 && !selectedId) {
                setSelectedId(data[0].id);
                setMessages(data[0].messages || []);
            }
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !newMessage.trim()) return;

        try {
            const msg = await StakeholderService.sendMessage(selectedId, newMessage);
            setMessages([...messages, msg]);
            setNewMessage('');
            fetchData(); // Refresh conversation list
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const activeConv = conversations.find(c => c.id === selectedId);
    const otherParticipant = activeConv?.participants.find(p => p.user?.id !== user?.id)?.user;

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] pb-4">
            <div className="flex h-full gap-6">
                {/* Conversations List */}
                <Card className="w-96 flex flex-col rounded-[2.5rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                    <CardHeader className="p-6 border-b border-border/50 space-y-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-black italic uppercase italic">Messages</CardTitle>
                            <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-bold" />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {conversations.map((conv) => {
                                const participant = conv.participants.find(p => p.user?.id !== user?.id)?.user;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => { setSelectedId(conv.id); setMessages(conv.messages || []); }}
                                        className={`w-full flex gap-3 p-4 rounded-3xl transition-all ${selectedId === conv.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-muted'}`}
                                    >
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black italic text-lg ${selectedId === conv.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                            {participant?.firstName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex justify-between items-start">
                                                <span className="font-black italic uppercase tracking-tight truncate">
                                                    {participant?.firstName} {participant?.lastName}
                                                </span>
                                                <span className={`text-[10px] font-bold ${selectedId === conv.id ? 'text-white/50' : 'text-muted-foreground'}`}>
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium truncate ${selectedId === conv.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                {conv.messages?.[0]?.content || 'Start a conversation...'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                    {selectedId ? (
                        <>
                            <CardHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black italic">
                                        {otherParticipant?.firstName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black italic uppercase italic">
                                            {otherParticipant?.firstName} {otherParticipant?.lastName}
                                        </CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-xl"><Phone className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl"><Video className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
                                </div>
                            </CardHeader>

                            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                                <div className="space-y-6">
                                    {messages.map((msg, idx) => {
                                        const isMine = msg.senderId === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] space-y-1.5`}>
                                                    <div className={`p-4 rounded-[1.5rem] shadow-sm font-medium text-sm ${isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-muted/50 rounded-tl-none'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold opacity-40 italic ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMine && (msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            <CardContent className="p-6 border-t border-border/50">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="flex-1 h-14 rounded-2xl bg-muted/50 border-none font-bold px-6"
                                    />
                                    <Button type="submit" className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group">
                                        <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="h-24 w-24 rounded-[2rem] bg-muted/50 flex items-center justify-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase italic">Your Messages</h3>
                                <p className="text-muted-foreground font-medium max-w-xs mx-auto">Select a conversation or start a new one to bridge the gap between home and school.</p>
                            </div>
                            <Button className="h-12 px-8 rounded-2xl font-black italic uppercase italic">New Conversation</Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

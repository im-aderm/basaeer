"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import {
    CreditCard,
    Search,
    Loader2,
    Users,
    ChevronRight,
    CheckCircle2,
    Clock,
    ArrowRightCircle,
    Printer,
    Download,
    Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaffService, Staff } from "@/services/staffService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import { CardService, IdCardTemplate, IdCard } from "@/services/cardService";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function EmployeeIdCardsPage() {
    const { showSuccess, showError } = useNotification();
    const { user, resolvedBranchId } = useAuth();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [cards, setCards] = useState<IdCard[]>([]);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [filters, setFilters] = useState({
        templateId: "",
        sessionId: ""
    });

    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffData, templatesData, sessionsData] = await Promise.all([
                StaffService.getAllStaff(),
                CardService.getAllTemplates(resolvedBranchId),
                SessionService.getAll()
            ]);

            setStaff(staffData);
            setSessions(sessionsData);
            // Only show EMPLOYEE templates
            setTemplates(templatesData.filter(t => t.type === 'EMPLOYEE'));

            // Set default session if available
            const activeSession = sessionsData.find(s => s.isActive);
            if (activeSession && !filters.sessionId) {
                setFilters(prev => ({ ...prev, sessionId: activeSession.id }));
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            showError("Failed to load employee data");
        } finally {
            setLoading(false);
        }
    };

    const fetchCards = async () => {
        if (!resolvedBranchId || !filters.sessionId) return;
        try {
            const cardData = await CardService.getAllCards(resolvedBranchId, filters.sessionId);
            setCards(cardData.filter(c => c.template?.type === 'EMPLOYEE'));
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch cards:", error);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (filters.sessionId) fetchCards();
    }, [filters.sessionId]);

    const handleGenerate = async () => {
        if (!filters.templateId || !filters.sessionId || selectedStaff.length === 0) {
            showError("Please select a template, session and at least one staff member");
            return;
        }

        setGenerating(true);
        try {
            await CardService.generateCards({
                templateId: filters.templateId,
                sessionId: filters.sessionId,
                staffIds: selectedStaff
            });
            showSuccess(`Successfully generated ID cards for ${selectedStaff.length} employees`);
            setSelectedStaff([]);
            fetchCards();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Generation failed:", error);
            showError("Failed to generate employee ID cards");
        } finally {
            setGenerating(false);
        }
    };

    const toggleStaff = (id: string) => {
        setSelectedStaff(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const filteredStaff = (staff ?? []).filter(s => {
        const matchesSearch = `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getCardForStaff = (staffId: string) => {
        return cards.find(c => c.staffId === staffId);
    };

    if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Briefcase className="text-primary w-10 h-10" />
                        Employee ID Management
                    </h1>
                    <p className="text-foreground/60 font-medium text-[12px]">Batch generate and manage employee identity cards.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button
                        disabled={selectedStaff.length === 0 || generating}
                        onClick={handleGenerate}
                        className="gap-3 rounded-xl h-12 px-6 font-semibold text-[12px] shadow-xl shadow-primary/20 hover:scale-105 transition-all bg-primary text-white"
                    >
                        {generating ? <Loader2 className="animate-spin" /> : <ArrowRightCircle size={20} />}
                        Generate {selectedStaff.length > 0 ? `(${selectedStaff.length})` : ''} Cards
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl border-primary/20 shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold uppercase text-foreground/60 ml-2">Academic Session</label>
                        <select
                            className="w-full h-10 rounded-xl bg-white border border-primary/90 font-semibold px-3 text-[12px] focus:ring-2 ring-primary/20"
                            value={filters.sessionId}
                            onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                        >
                            <option value="">Select Session...</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold uppercase text-foreground/60 ml-2">ID Template</label>
                        <select
                            className="w-full h-10 rounded-xl bg-white border border-primary/90 font-semibold px-3 text-[12px] focus:ring-2 ring-primary/20"
                            value={filters.templateId}
                            onChange={(e) => setFilters({ ...filters, templateId: e.target.value })}
                        >
                            <option value="">Select Template...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold uppercase text-foreground/60 ml-2">Search Employees</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60" size={18} />
                            <Input
                                placeholder="Name, email or department..."
                                className="pl-12 h-10 rounded-xl bg-muted/50 border-none font-semibold text-[12px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Staff List */}
            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden border-t-8 border-t-primary/10">
                <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-[12px] font-semibold tracking-tight">Employee Directory</CardTitle>
                        <div className="text-[12px] font-bold text-foreground/60">
                            {selectedStaff.length} selected / {filteredStaff.length} total
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={`${TABLE_HEADER_CELL_NO_SORT} w-10`}>
                                        <Checkbox
                                            checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedStaff(filteredStaff.map(s => s.id));
                                                else setSelectedStaff([]);
                                            }}
                                        />
                                    </th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Employee Info</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Department / Designation</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>ID Status</th>
                                    <th className={`${TABLE_HEADER_CELL_NO_SORT} text-right`}>Action</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {filteredStaff.map((member) => {
                                    const card = getCardForStaff(member.id);
                                    return (
                                        <tr key={member.id} className={TABLE_ROW}>
                                            <td className="px-3 py-1.5">
                                                <Checkbox
                                                    checked={selectedStaff.includes(member.id)}
                                                    onCheckedChange={() => toggleStaff(member.id)}
                                                />
                                            </td>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-muted bg-muted flex items-center justify-center text-foreground/60">
                                                        <Users size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[12px] tracking-tight">{member.user.firstName} {member.user.lastName}</div>
                                                        <div className="text-[12px] font-bold text-foreground/60">{member.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="font-bold text-[12px]">{member.designationRef?.name || member.department?.name || 'N/A'}</div>
                                                <div className="text-[12px] font-medium text-foreground/60">{member.department?.name || ''}</div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                {card ? (
                                                    <div className="flex items-center gap-2 text-primary font-semibold uppercase text-[12px]">
                                                        <CheckCircle2 size={14} /> Generated
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-amber-500 font-semibold uppercase text-[12px]">
                                                        <Clock size={14} /> Pending
                                                    </div>
                                                )}
                                            </td>
                                            <td className={TABLE_CELL_ACTIONS}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {card && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary">
                                                            <Printer size={16} />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted group-hover:bg-white/50">
                                                        <ChevronRight size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}

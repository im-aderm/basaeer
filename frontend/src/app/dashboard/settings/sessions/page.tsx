"use client";

import { useState, useEffect } from "react";
import { SessionService, AcademicSession } from "@/services/sessionService";
import {
    Plus,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Loader2,
    MoreVertical,
    Trash2,
    Edit,
    Check
} from "lucide-react";
import { clsx } from "clsx";

export default function SessionsPage() {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await SessionService.getAll();
            setSessions(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (session?: AcademicSession) => {
        if (session) {
            setEditingSession(session);
            setFormData({
                name: session.name,
                startDate: new Date(session.startDate).toISOString().split('T')[0],
                endDate: new Date(session.endDate).toISOString().split('T')[0],
                isActive: session.isActive
            });
        } else {
            setEditingSession(null);
            setFormData({
                name: "",
                startDate: "",
                endDate: "",
                isActive: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSession) {
                await SessionService.update(editingSession.id, formData);
            } else {
                await SessionService.create(formData);
            }
            setIsModalOpen(false);
            fetchSessions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save session:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this session? This may affect academic records.")) {
            try {
                await SessionService.delete(id);
                fetchSessions();
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error("Failed to delete session:", error);
            }
        }
    };

    const toggleActive = async (session: AcademicSession) => {
        if (session.isActive) return;
        try {
            await SessionService.update(session.id, { isActive: true });
            fetchSessions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to activate session:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Academic Sessions</h1>
                    <p className="text-muted-foreground mt-1">Manage school years and set current active term.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    New Session
                </button>
            </div>

            {/* Sessions List */}
            <div className="bg-white/75 border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold">Session Name</th>
                                <th className="px-6 py-4 text-sm font-semibold">Duration</th>
                                <th className="px-6 py-4 text-sm font-semibold">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "p-2 rounded-lg",
                                                session.isActive ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                                            )}>
                                                <Calendar size={18} />
                                            </div>
                                            <span className="font-medium">{session.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {session.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold ring-1 ring-inset ring-green-600/20">
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => toggleActive(session)}
                                                className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
                                            >
                                                Mark as Active
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(session)}
                                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <AlertCircle size={40} className=" opacity-20" />
                                            <p>No academic sessions found. Create one to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white/75 w-full max-w-md rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-border">
                                <h3 className="text-xl font-bold">{editingSession ? "Edit Session" : "Create New Session"}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Session Name</label>
                                    <input
                                        required
                                        placeholder="e.g. 2024/2025"
                                        className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Start Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">End Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-4 h-4 rounded border-primary/60 text-primary focus:ring-primary"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium">Set as current active session</label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold hover:bg-muted rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-shadow shadow-lg shadow-primary/20 font-semibold"
                                >
                                    {editingSession ? "Save Changes" : "Create Session"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

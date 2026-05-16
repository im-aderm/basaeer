"use client";

import { useState, useEffect } from "react";
import { Video, Clock, Calendar, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function StudentLiveClassesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.student?.id) {
            fetchSessions();
        }
    }, [user]);

    const fetchSessions = async () => {
        if (!user?.student?.id) return;
        try {
            const response = await api.get(`/live-classes/sessions/student/${user.student.id}`);
            setSessions(response.data);
        } catch (error) {
            toast.error("Failed to load live classes");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMeeting = async (session: any) => {
        try {
            await api.post(`/live-classes/sessions/${session.id}/join`);
            window.open(session.meetingUrl, "_blank");
            toast.success("Joined meeting!");
            fetchSessions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to join meeting");
        }
    };

    const getTimeUntilStart = (scheduledStart: string) => {
        const now = new Date();
        const start = new Date(scheduledStart);
        const diff = start.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 0) return "Started";
        if (minutes === 0) return "Starting now";
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const canJoin = (session: any) => {
        if (session.status !== "ACTIVE") return false;
        const now = new Date();
        const start = new Date(session.scheduledStart);
        const diff = start.getTime() - now.getTime();
        return diff <= 5 * 60 * 1000; // Can join 5 minutes before
    };

    const upcomingSessions = (sessions ?? []).filter((s) => s.status === "SCHEDULED");
    const activeSessions = (sessions ?? []).filter((s) => s.status === "ACTIVE");
    const pastSessions = (sessions ?? []).filter((s) => ["ENDED", "CANCELLED"].includes(s.status));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-h1 font-bold tracking-tight text-primary">
                    My Live Classes
                </h1>
 <p className="text-slate-600 mt-2">
                    Join your scheduled online classes
                </p>
            </div>

            {/* Active Sessions */}
            {activeSessions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-emerald-600" />
                        Live Now
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {activeSessions.map((session) => (
                            <div
                                key={session.id}
 className="bg-gradient-to-r from-emerald-50 to-teal-50 backdrop-blur-xl rounded-2xl p-6 border-2 border-emerald-200 animate-pulse-slow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white animate-pulse">
                                                LIVE
                                            </span>
                                            <h3 className="font-bold text-lg">{session.title}</h3>
                                        </div>
 <p className="text-sm text-slate-600 mb-4">
                                            {session.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {session._count?.participants || 0} participants
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {session.duration} minutes
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleJoinMeeting(session)}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                        size="lg"
                                    >
                                        <Video className="w-5 h-5 mr-2" />
                                        Join Meeting
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Sessions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Upcoming Classes
                </h2>
                {upcomingSessions.length === 0 ? (
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 text-center">
 <Video className="w-16 h-16 mx-auto text-slate-300 mb-4" />
 <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No upcoming classes
                        </h3>
 <p className="text-slate-500 ">
                            Your teachers haven't scheduled any live classes yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingSessions.map((session) => {
                            const timeUntil = getTimeUntilStart(session.scheduledStart);
                            const joinable = canJoin(session);

                            return (
                                <div
                                    key={session.id}
 className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-lg flex-1">{session.title}</h3>
                                        {timeUntil === "Starting now" && (
 <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 ">
                                                Soon
                                            </span>
                                        )}
                                    </div>
 <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                        {session.description}
                                    </p>
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(session.scheduledStart).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {new Date(session.scheduledStart).toLocaleTimeString()} ({session.duration}min)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-emerald-500" />
                                            Starts in {timeUntil}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleJoinMeeting(session)}
                                        disabled={!joinable}
                                        className="w-full"
                                    >
                                        {joinable ? "Join Meeting" : `Available in ${timeUntil}`}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Past Classes</h2>
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                        <div className="space-y-3">
                            {pastSessions.slice(0, 5).map((session) => {
                                const attended = session.participants?.some(
                                    (p: any) => p.studentId === user?.student?.id
                                );

                                return (
                                    <div
                                        key={session.id}
 className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {attended ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-slate-400" />
                                            )}
                                            <div>
                                                <p className="font-medium">{session.title}</p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(session.scheduledStart).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${attended
 ? "bg-emerald-100 text-emerald-700 "
 : "bg-slate-100 text-slate-700 "
                                                }`}
                                        >
                                            {attended ? "Attended" : "Missed"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* System Check Info */}
 <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
 <h3 className="font-semibold text-blue-900 mb-3">
                    Before Joining a Class
                </h3>
 <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 ">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Allow camera and microphone permissions when prompted</li>
                    <li>Use headphones to avoid echo</li>
                    <li>Join 5 minutes before the scheduled time</li>
                    <li>Keep your microphone muted unless speaking</li>
                </ul>
            </div>
        </div>
    );
}

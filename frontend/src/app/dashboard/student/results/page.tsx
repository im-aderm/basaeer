"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

interface PublishedResultRow {
    sessionId: string;
    sessionName: string;
    term: string;
    average: number | null;
    finalGrade: string | null;
    classPosition: number | null;
}

export default function StudentResultsPage() {
    const { user } = useAuth();
    const { showError } = useNotification();
    const studentId = user?.student?.id;

    const [rows, setRows] = useState<PublishedResultRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return;
        ExamService.getMyPublishedResults(studentId)
            .then(setRows)
            .catch(() => showError("Failed to load your results"))
            .finally(() => setLoading(false));
    }, [studentId]);

    const rowKey = (row: PublishedResultRow) => `${row.sessionId}::${row.term}`;

    const toggleExpand = async (row: PublishedResultRow) => {
        const key = rowKey(row);
        if (expanded === key) {
            setExpanded(null);
            return;
        }
        setExpanded(key);
        setDetail(null);
        setDetailLoading(true);
        try {
            const data = await ExamService.getPublishedResult(studentId!, row.sessionId, row.term as any);
            setDetail(data);
        } catch {
            showError("Failed to load result detail");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownload = async (row: PublishedResultRow) => {
        const key = rowKey(row);
        setDownloadingKey(key);
        try {
            const blob = await ExamService.downloadReportCard(studentId!, row.sessionId, row.term as any);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ReportCard_${row.sessionName}_${row.term}.pdf`.replace(/\s+/g, "_");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            showError("Failed to download report card");
        } finally {
            setDownloadingKey(null);
        }
    };

    if (loading) {
        return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">My Results</h1>
                    <p className="text-sm text-muted-foreground">Published term reports for your record.</p>
                </div>
            </div>

            {rows.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No published results yet. Check back once your school publishes this term's results.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => {
                        const key = rowKey(row);
                        const isOpen = expanded === key;
                        return (
                            <Card key={key}>
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() => toggleExpand(row)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{row.sessionName} — {row.term} Term</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Average: {row.average != null ? Number(row.average).toFixed(1) : "—"} ·
                                                Grade: {row.finalGrade ?? "—"} ·
                                                Position: {row.classPosition ?? "—"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={downloadingKey === key}
                                                onClick={(e) => { e.stopPropagation(); handleDownload(row); }}
                                            >
                                                {downloadingKey === key ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                                PDF
                                            </Button>
                                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </CardHeader>
                                {isOpen && (
                                    <CardContent>
                                        {detailLoading ? (
                                            <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                        ) : detail?.records?.length ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                                                            <th className="py-2">Subject</th>
                                                            <th className="py-2 text-center">Total</th>
                                                            <th className="py-2 text-center">Grade</th>
                                                            <th className="py-2 text-center">Position</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {detail.records.map((r: any) => (
                                                            <tr key={r.id} className="border-b last:border-0">
                                                                <td className="py-2">{r.subject?.name}</td>
                                                                <td className="py-2 text-center">{Number(r.total || 0).toFixed(1)}</td>
                                                                <td className="py-2 text-center">{r.grade || "-"}</td>
                                                                <td className="py-2 text-center">{r.position || "-"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No subject breakdown available.</p>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

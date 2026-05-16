"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AcademicService } from "@/services/academicService";
import { StudentService } from "@/services/studentService";
import { Loader2, Printer, ChevronLeft } from "lucide-react";
import { Term } from "@/types/enums";
import Link from "next/link";

export default function OpenDayReportPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params.studentId as string;
    const sessionId = searchParams.get("sessionId") || "";
    const term = searchParams.get("term") as Term || Term.FIRST;

    const [student, setStudent] = useState<any>(null);
    const [performance, setPerformance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId && sessionId) {
            fetchData();
        }
    }, [studentId, sessionId, term]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentData, perfData] = await Promise.all([
                StudentService.getById(studentId),
                AcademicService.getOpenDayPerformance(studentId, sessionId, term)
            ]);
            setStudent(studentData);
            setPerformance(perfData);
        } catch (error) {
            console.error("Failed to fetch open day data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4 md:p-12 print:p-0">
            {/* Nav - Hidden on print */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href="/dashboard/academics/exams/marks" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft size={20} /> Back to Marks Entry
                </Link>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                    <Printer size={18} /> Print Report
                </button>
            </div>

            {/* Report Content */}
            <div className="max-w-4xl mx-auto border-4 border-double border-primary/20 p-8 md:p-16 rounded-[2rem] shadow-2xl shadow-primary/5 bg-white relative overflow-hidden print:shadow-none print:border-none">
                {/* Background watermark icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <img src="/logo.png" alt="" className="w-96 h-96 grayscale" />
                </div>

                {/* School Header */}
                <div className="text-center mb-12 border-b-2 border-primary/10 pb-8">
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Basaeer International School</h1>
                    <p className="text-muted-foreground font-bold tracking-[0.3em] mt-2">Open Day Performance Report</p>
                    <div className="flex justify-center gap-4 mt-4 text-xs font-bold">
                        <span className="bg-muted px-4 py-1 rounded-full">Session: {sessionId}</span>
                        <span className="bg-muted px-4 py-1 rounded-full">Term: {term}</span>
                    </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-8 mb-12 bg-muted/20 p-6 rounded-2xl border border-border">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Student Name</p>
                        <p className="text-2xl font-black tracking-tight">{student?.user?.firstName} {student?.user?.lastName}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Student ID</p>
                        <p className="text-2xl font-black tracking-tight">{student?.studentId || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Class / Section</p>
                        <p className="font-bold text-lg">{student?.class?.name} - {student?.section?.name}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Report Date</p>
                        <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Performance Table */}
                <div className="mb-12">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                        Continuous Assessment Summary
                    </h3>
                    <div className="border border-border rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary">Subject</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary">Breakdown</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary text-right">CA Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {performance.map((p, i) => (
                                    <tr key={i} className="hover:bg-muted/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-lg">{p.subject}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {p.assessments.map((a: any, ai: number) => (
                                                    <div key={ai} className="bg-muted px-2 py-1 rounded-lg text-[10px] font-bold">
                                                        {a.name}: <span className="text-primary">{a.score}/{a.maxScore}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl text-primary font-black text-xl">
                                                {p.caTotal}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Notes */}
                <div className="mt-16 pt-8 border-t-2 border-dashed border-border flex justify-between items-end">
                    <div className="max-w-xs space-y-4">
                        <div className="h-1 bg-muted w-32"></div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground leading-tight">
                            Note: This report contains preliminary Continuous Assessment (CA) scores and excludes final exam results. It is intended for mid-term progress review.
                        </p>
                    </div>
                    <div className="text-right space-y-4">
                        <div className="h-20 w-48 border-b-2 border-border mb-2 mx-auto"></div>
                        <p className="text-[10px] uppercase font-bold text-primary tracking-widest">School Administrator Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

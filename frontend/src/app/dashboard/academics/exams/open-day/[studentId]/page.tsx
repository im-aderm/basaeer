"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AcademicService } from "@/services/academicService";
import { StudentService } from "@/services/studentService";
import { Loader2, Printer, ChevronLeft } from "lucide-react";
import { Term } from "@/types/enums";
import Link from "next/link";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from '@/lib/table-styles';
import { clsx } from 'clsx';

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
            <div className="max-w-4xl mx-auto border-2 border-double border-primary/20 p-4 md:p-8 print:p-0 rounded-2xl shadow-lg shadow-primary/5 bg-white relative overflow-hidden print:shadow-none print:border-none">
                {/* Background watermark icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <img src="/logo.png" alt="" className="w-96 h-96 grayscale" />
                </div>

                {/* School Header */}
                <div className="text-center mb-12 border-b-2 border-primary/10 pb-8">
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Basaeer International School</h1>
                    <p className="text-foreground/60 font-bold tracking-[0.2em] mt-1 text-[12px]">Open Day Performance Report</p>
                    <div className="flex justify-center gap-3 mt-3 text-[10px] font-bold">
                        <span className="bg-muted px-3 py-0.5 rounded-full">Session: {sessionId}</span>
                        <span className="bg-muted px-3 py-0.5 rounded-full">Term: {term}</span>
                    </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 mb-8 bg-muted/20 p-4 rounded-xl border border-primary/20">
                    <div className="space-y-0.5">
                        <p className="text-[9px] uppercase font-bold text-foreground/60 tracking-widest">Student Name</p>
                        <p className="text-[16px] font-black tracking-tight">{student?.user?.firstName} {student?.user?.lastName}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-[9px] uppercase font-bold text-foreground/60 tracking-widest">Student ID</p>
                        <p className="text-[16px] font-black tracking-tight">{student?.studentId || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] uppercase font-bold text-foreground/60 tracking-widest">Class / Section</p>
                        <p className="font-bold text-[12px]">{student?.class?.name} - {student?.section?.name}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-[9px] uppercase font-bold text-foreground/60 tracking-widest">Report Date</p>
                        <p className="font-bold text-[12px]">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Performance Table */}
                <div className="mb-12">
                    <h3 className="text-[14px] font-black mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        Continuous Assessment Summary
                    </h3>
                    <div className="border border-primary/20 rounded-xl overflow-hidden">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Subject</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Breakdown</th>
                                    <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-right")}>CA Total</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {performance.map((p, i) => (
                                    <tr key={i} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>{p.subject}</td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.assessments.map((a: any, ai: number) => (
                                                    <div key={ai} className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                        {a.name}: <span className="text-primary">{a.score}/{a.maxScore}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className={clsx(TABLE_CELL, "text-right")}>
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg text-primary font-black text-[14px]">
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
                <div className="mt-8 pt-4 border-t-2 border-dashed border-primary/20 flex justify-between items-end">
                    <div className="max-w-xs space-y-2">
                        <div className="h-0.5 bg-muted w-24"></div>
                        <p className="text-[9px] uppercase font-bold text-foreground/60 leading-tight">
                            Note: This report contains preliminary Continuous Assessment (CA) scores and excludes final exam results. It is intended for mid-term progress review.
                        </p>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="h-12 w-36 border-b-2 border-primary/20 mb-1 mx-auto"></div>
                        <p className="text-[9px] uppercase font-bold text-primary tracking-widest">School Administrator Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

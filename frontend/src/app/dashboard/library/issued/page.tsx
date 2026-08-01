"use client";

import { useState, useEffect } from "react";
import {
    Bookmark,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    CalendarDays,
    BookOpen,
    User,
    ArrowLeft,
    SwitchCamera
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LibraryService, BorrowRecord } from "@/services/libraryService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from "@/lib/table-styles";

export default function MyIssuedBookPage() {
    const { user, resolvedBranchId } = useAuth();
    const [records, setRecords] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user?.student?.id) {
                setLoading(false);
                return;
            }
            try {
                const data = await LibraryService.getMyBorrowHistory();
                setRecords(data);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error("Failed to fetch issued books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'BORROWED':
                return <Badge className="bg-blue-500/10 text-blue-600 border-none font-semibold gap-1"><Clock className="w-3 h-3" /> Borrowed</Badge>;
            case 'OVERDUE':
                return <Badge className="bg-red-500/10 text-red-600 border-none font-semibold gap-1"><AlertCircle className="w-3 h-3" /> Overdue</Badge>;
            case 'RETURNED':
                return <Badge className="bg-green-500/10 text-green-600 border-none font-semibold gap-1"><CheckCircle className="w-3 h-3" /> Returned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    if (!user?.student?.id) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <div className="bg-white/75 border border-primary/20 p-4 rounded-2xl shadow-sm">
                    <div className="flex flex-col items-center text-center py-12 space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <SwitchCamera className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight text-primary mb-2">Student Access Only</h1>
                            <p className="text-foreground/60 font-medium max-w-md">
                                This page shows books currently issued to you. Log in with a student account or switch your role to student to view your borrowing history.
                            </p>
                        </div>
                        <Link href="/dashboard/library">
                            <Button variant="outline" className="rounded-xl gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Library
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="bg-white/75 border border-primary/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/dashboard/library">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3 text-blue-600">
                            <Bookmark className="w-10 h-10" />
                            My Issued Books
                        </h1>
                    </div>
                    <p className="text-foreground/60 mt-2 text-[12px] font-medium ml-16">Track the books currently in your possession.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden border-t-8 border-t-blue-500">
                <div className="overflow-x-auto">
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Book</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Borrow Date</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Due Date</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Return Date</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {records.length > 0 ? records.map((record) => (
                                <tr key={record.id} className={TABLE_ROW}>
                                    <td className={TABLE_CELL_PRIMARY}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-muted/30 rounded-lg flex items-center justify-center border border-primary/20">
                                                <BookOpen size={20} className="text-foreground/30" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{record.book?.title || 'Unknown Book'}</p>
                                                <p className="text-[10px] font-bold text-foreground/60">{record.book?.author || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <div className="flex items-center gap-2 text-[12px] font-medium">
                                            <CalendarDays size={14} className="text-blue-500" />
                                            {new Date(record.borrowDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <div className="flex items-center gap-2 text-[12px] font-medium">
                                            <Clock size={14} className="text-amber-500" />
                                            {new Date(record.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <div className="flex items-center gap-2 text-[12px] font-medium">
                                            {record.returnDate ? (
                                                <>
                                                    <CheckCircle size={14} className="text-green-500" />
                                                    {new Date(record.returnDate).toLocaleDateString()}
                                                </>
                                            ) : (
                                                <span className="text-foreground/60">--</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        {getStatusBadge(record.status)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center space-y-4">
                                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                                            <Bookmark size={32} className="text-foreground/30" />
                                        </div>
                                        <h3 className="text-[12px] font-semibold">No books issued</h3>
                                        <p className="text-foreground/60 font-medium">You have not borrowed any books yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

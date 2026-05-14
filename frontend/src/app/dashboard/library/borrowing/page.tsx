"use client";

import { useState, useEffect } from "react";
import {
    Bookmark,
    ArrowRight,
    Calendar,
    Clock,
    CheckCircle,
    Loader2,
    CalendarDays,
    Search,
    BookOpen,
    HelpCircle,
    User
} from "lucide-react";
import { LibraryService, BorrowRecord } from "@/services/libraryService";
import { StudentService, Student } from "@/services/studentService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LibraryBorrowingPage() {
    const [borrowingHistory, setBorrowingHistory] = useState<BorrowRecord[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [issueData, setIssueData] = useState({
        bookId: "",
        studentId: "",
        dueDate: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [historyData, studentsData, booksData] = await Promise.all([
                LibraryService.getAllBorrowRecords(),
                StudentService.getAll(),
                LibraryService.getAllBooks()
            ]);
            setBorrowingHistory(historyData);
            setStudents(studentsData);
            setBooks(booksData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturn = async (id: string) => {
        try {
            const result = await LibraryService.returnBook(id);
            if (result.fineAmount > 0) {
                toast.warning(`Book returned with a fine of $${result.fineAmount}`);
            } else {
                toast.success("Book returned successfully");
            }
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Return failed:", error);
            toast.error("Failed to process return");
        }
    };

    const handleIssueBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LibraryService.borrowBook(issueData);
            toast.success("Book issued successfully");
            setIsIssueModalOpen(false);
            setIssueData({ bookId: "", studentId: "", dueDate: "" });
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Issue failed:", error);
            toast.error("Failed to issue book. Check availability.");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BORROWED': return 'bg-blue-500/10 text-blue-500';
            case 'OVERDUE': return 'bg-red-500/10 text-red-500';
            case 'RETURNED': return 'bg-green-500/10 text-green-500';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (loading && borrowingHistory.length === 0) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section */}
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10">
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3 text-purple-600">
                        <Bookmark className="w-10 h-10" />
                        Borrowing Records
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Track book circulations and manage student returns.</p>
                </div>
                <div className="relative z-10">
                    <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 rounded-2xl px-10 font-semibold shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all gap-3 bg-purple-600">
                                Issue New Book <ArrowRight size={20} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold mb-6">Issue Book</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleIssueBook} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1">Select Book</Label>
                                    <select
                                        required
                                        className="w-full rounded-xl h-12 px-4 border bg-card font-bold"
                                        value={issueData.bookId}
                                        onChange={e => setIssueData({ ...issueData, bookId: e.target.value })}
                                    >
                                        <option value="">Choose a book...</option>
                                        {(books ?? []).filter(b => b.available > 0).map(book => (
                                            <option key={book.id} value={book.id}>{book.title} ({book.available} left)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1">Select Student</Label>
                                    <select
                                        required
                                        className="w-full rounded-xl h-12 px-4 border bg-card font-bold"
                                        value={issueData.studentId}
                                        onChange={e => setIssueData({ ...issueData, studentId: e.target.value })}
                                    >
                                        <option value="">Choose a student...</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1">Due Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        className="rounded-xl h-12"
                                        value={issueData.dueDate}
                                        onChange={e => setIssueData({ ...issueData, dueDate: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/20 bg-purple-600 mt-4">
                                    Confirm Issue
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            {/* Records Log Design */}
            <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden border-t-8 border-t-purple-500">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/30 text-left border-b border-border">
                                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center w-20">Status</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Resource / Book</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center">Dates</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Student Details</th>
                                <th className="px-10 py-6 text-[10px] text-right uppercase tracking-[0.2em] font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {borrowingHistory.length > 0 ? borrowingHistory.map(record => (
                                <tr key={record.id} className="hover:bg-muted/5 transition-all group">
                                    <td className="px-10 py-8 text-center">
                                        <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center font-semibold ${getStatusColor(record.status)} shadow-lg shadow-current/5`}>
                                            {record.status === 'BORROWED' && <Clock size={24} />}
                                            {record.status === 'OVERDUE' && <AlertCircle size={24} />}
                                            {record.status === 'RETURNED' && <CheckCircle size={24} />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-muted/30 rounded-lg flex items-center justify-center border border-border/50">
                                                <BookOpen size={20} className="text-muted-foreground/50" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg tracking-tight">{record.book?.title}</p>
                                                <p className="text-xs font-bold text-muted-foreground capitalize">{record.book?.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <div className="inline-block text-left space-y-1">
                                            <p className="flex items-center gap-2 text-xs font-bold">
                                                <CalendarDays size={14} className="text-blue-500" />
                                                <span className="text-muted-foreground shrink-0 uppercase tracking-tighter w-14">Issued:</span>
                                                <span>{new Date(record.borrowDate).toLocaleDateString()}</span>
                                            </p>
                                            <p className="flex items-center gap-2 text-xs font-bold">
                                                <Clock size={14} className="text-red-500" />
                                                <span className="text-muted-foreground shrink-0 uppercase tracking-tighter w-14 text-center">Due:</span>
                                                <span className="text-red-500">{new Date(record.dueDate).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{record.student?.firstName} {record.student?.lastName}</p>
                                                <p className="text-label text-muted-foreground">ID: {record.student?.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {record.status !== 'RETURNED' && (
                                                <Button
                                                    variant="outline"
                                                    className="h-10 rounded-xl font-semibold bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-600 hover:text-white transition-all px-4"
                                                    onClick={() => handleReturn(record.id)}
                                                >
                                                    Mark Return
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10">
                                                <HelpCircle size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border">
                                            <Search size={32} className="text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-h3 font-semibold">No records found</h3>
                                        <p className="text-muted-foreground font-medium">Active book circulations will appear here.</p>
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

function AlertCircle({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

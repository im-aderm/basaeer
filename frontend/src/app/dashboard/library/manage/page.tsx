"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import {
    BookOpen,
    ArrowLeftRight,
    User,
    Calendar,
    Bookmark,
    Loader2,
    Search,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Library,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from '@/context/NotificationContext';
import { LibraryService, Book as BookType, BorrowRecord } from "@/services/libraryService";
import { StudentService, Student } from "@/services/studentService";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from "@/lib/table-styles";

type Tab = "active" | "issue";

export default function BookIssueReturnPage() {
    const { showSuccess, showError } = useNotification();
    const [tab, setTab] = useState<Tab>("active");
    const [records, setRecords] = useState<BorrowRecord[]>([]);
    const [books, setBooks] = useState<BookType[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        bookId: "",
        studentId: "",
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recordsRes, booksRes, studentsRes] = await Promise.all([
                LibraryService.getAllBorrowRecords(),
                LibraryService.getAllBooks({ limit: 1000 }),
                StudentService.getAll(),
            ]);
            setRecords(Array.isArray(recordsRes) ? recordsRes : []);
            const bookData = Array.isArray(booksRes) ? booksRes : booksRes.data;
            setBooks(Array.isArray(bookData) ? bookData : []);
            setStudents(Array.isArray(studentsRes) ? studentsRes : []);
        } catch (error) {
            showError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleIssueBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bookId || !formData.studentId || !formData.dueDate) {
            showError("Please fill all required fields");
            return;
        }
        setSubmitting(true);
        try {
            await LibraryService.borrowBook(formData);
            showSuccess("Book issued successfully");
            setFormData({
                bookId: "",
                studentId: "",
                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
            });
            fetchData();
            setTab("active");
        } catch (error) {
            showError("Failed to issue book");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (recordId: string) => {
        try {
            const result = await LibraryService.returnBook(recordId);
            const fineAmount = (result as any).fineAmount || 0;
            if (fineAmount > 0) {
                showSuccess(`Book returned successfully. Fine amount: ₦${fineAmount.toLocaleString()}`);
            } else {
                showSuccess("Book returned successfully");
            }
            fetchData();
        } catch (error) {
            showError("Failed to return book");
        }
    };

    const activeRecords = (records ?? []).filter((r) => r.status === "BORROWED" || r.status === "OVERDUE");
    const filteredActive = activeRecords.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const bookTitle = r.book?.title?.toLowerCase() || "";
        const studentName =
            `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.toLowerCase();
        return bookTitle.includes(q) || studentName.includes(q);
    });

    const availableBooks = (books ?? []).filter((b) => b.available > 0);

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "active", label: "Active Borrowings", icon: Bookmark },
        { key: "issue", label: "Issue Book", icon: ArrowLeftRight },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Library className="text-primary w-10 h-10" />
                        Issue & Return
                    </h1>
                    <p className="text-foreground/60 font-medium text-[12px]">
                        Issue books to students and manage returns.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-primary/20 pb-1">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${
                            tab === t.key
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <t.icon size={18} />
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "active" && (
                <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-3 pt-3">
                        <CardTitle className="text-[12px] font-semibold tracking-tight">
                            Active Borrowings
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60" size={18} />
                            <Input
                                placeholder="Search by book or student..."
                                className="pl-10 rounded-xl bg-muted/30 border-none h-11"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead>
                                    <tr className={TABLE_HEADER}>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Book Title</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Student Name</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Borrow Date</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Due Date</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    {filteredActive.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <BookOpen className="h-10 w-10 text-foreground/30" />
                                                    <p className="text-foreground/60 font-medium">
                                                        {search ? "No matching borrowings found." : "No active borrowings."}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredActive.map((record) => {
                                            const isOverdue =
                                                record.status === "OVERDUE" ||
                                                (record.status === "BORROWED" &&
                                                    new Date(record.dueDate) < new Date());
                                            return (
                                                <tr key={record.id} className={TABLE_ROW}>
                                                    <td className={TABLE_CELL_PRIMARY}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <BookOpen size={18} />
                                                            </div>
                                                            {record.book?.title || "Unknown Book"}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-foreground/60" />
                                                            {record.student?.firstName || ""}{" "}
                                                            {record.student?.lastName || ""}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <div className="flex items-center gap-2 text-foreground/60">
                                                            <Calendar size={14} />
                                                            {new Date(record.borrowDate).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <div className="flex items-center gap-2 text-foreground/60">
                                                            <Calendar size={14} />
                                                            {new Date(record.dueDate).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${
                                                                isOverdue
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-green-100 text-green-700"
                                                            }`}
                                                        >
                                                            {isOverdue ? (
                                                                <>
                                                                    <AlertTriangle size={12} /> Overdue
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 size={12} /> Active
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className={TABLE_CELL_ACTIONS}>
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl"
                                                            onClick={() => handleReturn(record.id)}
                                                        >
                                                            Return
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {tab === "issue" && (
                <div className="max-w-2xl mx-auto">
                    <Card className="rounded-2xl border-primary/20 shadow-xl">
                        <CardHeader className="px-3 pt-3">
                            <CardTitle className="text-[12px] font-semibold tracking-tight text-primary flex items-center gap-3">
                                <ArrowLeftRight className="text-primary" size={24} />
                                Issue a Book
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <form onSubmit={handleIssueBook} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="book" className="text-sm font-semibold">
                                        Select Book
                                    </Label>
                                    <select
                                        id="book"
                                        required
                                        value={formData.bookId}
                                        onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                                        className="w-full h-12 rounded-xl bg-white border border-primary/90 text-base px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Choose a book...</option>
                                        {availableBooks.map((book) => (
                                            <option key={book.id} value={book.id}>
                                                {book.title} by {book.author} ({book.available} available)
                                            </option>
                                        ))}
                                    </select>
                                    {availableBooks.length === 0 && (
                                        <p className="text-[12px] text-foreground/60 mt-1">
                                            No books available for borrowing.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student" className="text-sm font-semibold">
                                        Select Student
                                    </Label>
                                    <select
                                        id="student"
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full h-12 rounded-xl bg-white border border-primary/90 text-base px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Choose a student...</option>
                                        {students.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.firstName} {s.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dueDate" className="text-sm font-semibold">
                                        Due Date
                                    </Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        required
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="h-12 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <ArrowLeftRight className="h-5 w-5 mr-2" />
                                    )}
                                    Issue Book
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    </RequireBranch>
    );
}

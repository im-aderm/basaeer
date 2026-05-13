"use client";

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LibraryService, Book as BookType, BorrowRecord } from "@/services/libraryService";
import { StudentService, Student } from "@/services/studentService";

type Tab = "active" | "issue";

export default function BookIssueReturnPage() {
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
            toast.error("Failed to load data");
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
            toast.error("Please fill all required fields");
            return;
        }
        setSubmitting(true);
        try {
            await LibraryService.borrowBook(formData);
            toast.success("Book issued successfully");
            setFormData({
                bookId: "",
                studentId: "",
                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
            });
            fetchData();
            setTab("active");
        } catch (error) {
            toast.error("Failed to issue book");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (recordId: string) => {
        try {
            const result = await LibraryService.returnBook(recordId);
            const fineAmount = (result as any).fineAmount || 0;
            if (fineAmount > 0) {
                toast.success(`Book returned successfully. Fine amount: ₦${fineAmount.toLocaleString()}`);
            } else {
                toast.success("Book returned successfully");
            }
            fetchData();
        } catch (error) {
            toast.error("Failed to return book");
        }
    };

    const activeRecords = records.filter((r) => r.status === "BORROWED" || r.status === "OVERDUE");
    const filteredActive = activeRecords.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const bookTitle = r.book?.title?.toLowerCase() || "";
        const studentName =
            `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.toLowerCase();
        return bookTitle.includes(q) || studentName.includes(q);
    });

    const availableBooks = books.filter((b) => b.available > 0);

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "active", label: "Active Borrowings", icon: Bookmark },
        { key: "issue", label: "Issue Book", icon: ArrowLeftRight },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3">
                        <Library className="text-primary w-10 h-10" />
                        Issue & Return
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Issue books to students and manage returns.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-border/50 pb-1">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${
                            tab === t.key
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <t.icon size={18} />
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "active" && (
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-8 pt-8">
                        <CardTitle className="text-h3 font-semibold tracking-tight">
                            Active Borrowings
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-8">Book Title</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Borrow Date</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredActive.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-3">
                                                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                                                    <p className="text-muted-foreground font-medium">
                                                        {search ? "No matching borrowings found." : "No active borrowings."}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredActive.map((record) => {
                                            const isOverdue =
                                                record.status === "OVERDUE" ||
                                                (record.status === "BORROWED" &&
                                                    new Date(record.dueDate) < new Date());
                                            return (
                                                <TableRow key={record.id} className="hover:bg-muted/30">
                                                    <TableCell className="px-8 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <BookOpen size={18} />
                                                            </div>
                                                            {record.book?.title || "Unknown Book"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-muted-foreground" />
                                                            {record.student?.firstName || ""}{" "}
                                                            {record.student?.lastName || ""}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar size={14} />
                                                            {new Date(record.borrowDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar size={14} />
                                                            {new Date(record.dueDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl"
                                                            onClick={() => handleReturn(record.id)}
                                                        >
                                                            Return
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {tab === "issue" && (
                <div className="max-w-2xl mx-auto">
                    <Card className="rounded-[2rem] border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-h3 font-semibold tracking-tight flex items-center gap-3">
                                <ArrowLeftRight className="text-primary" size={24} />
                                Issue a Book
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
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
                                        className="w-full h-12 rounded-xl bg-muted/30 border-border text-base px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    >
                                        <option value="">Choose a book...</option>
                                        {availableBooks.map((book) => (
                                            <option key={book.id} value={book.id}>
                                                {book.title} by {book.author} ({book.available} available)
                                            </option>
                                        ))}
                                    </select>
                                    {availableBooks.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
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
                                        className="w-full h-12 rounded-xl bg-muted/30 border-border text-base px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
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
    );
}

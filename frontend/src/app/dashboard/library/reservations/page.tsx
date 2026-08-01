"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import {
    Bookmark,
    ScanBarcode,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Plus,
    BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNotification } from '@/context/NotificationContext';
import { LibraryService, Book as BookType, BookReservation } from "@/services/libraryService";
import { StudentService, Student } from "@/services/studentService";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from "@/lib/table-styles";

type Tab = "queue" | "copies";

export default function LibraryReservationsPage() {
    const { showSuccess, showError } = useNotification();
    const [tab, setTab] = useState<Tab>("queue");
    const [reservations, setReservations] = useState<BookReservation[]>([]);
    const [books, setBooks] = useState<BookType[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [isReserveOpen, setIsReserveOpen] = useState(false);
    const [reserveForm, setReserveForm] = useState({ bookId: "", studentId: "" });

    const [isCopyOpen, setIsCopyOpen] = useState(false);
    const [copyForm, setCopyForm] = useState({ bookId: "", barcode: "", accessionNumber: "" });

    const [barcodeForm, setBarcodeForm] = useState({
        barcode: "",
        studentId: "",
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reservationsData, booksData, studentsData] = await Promise.all([
                LibraryService.getReservations(),
                LibraryService.getAllBooks({ limit: 1000 }),
                StudentService.getAll(),
            ]);
            setReservations(Array.isArray(reservationsData) ? reservationsData : []);
            const bookData = Array.isArray(booksData) ? booksData : booksData.data;
            setBooks(Array.isArray(bookData) ? bookData : []);
            setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch {
            showError("Failed to load reservation data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LibraryService.reserveBook(reserveForm);
            showSuccess("Book reserved successfully");
            setIsReserveOpen(false);
            setReserveForm({ bookId: "", studentId: "" });
            fetchData();
        } catch (error: any) {
            showError(error?.response?.data?.message || "Failed to reserve book");
        }
    };

    const handleFulfill = async (id: string) => {
        try {
            await LibraryService.fulfillReservation(id);
            showSuccess("Reservation fulfilled — book issued to student");
            fetchData();
        } catch (error: any) {
            showError(error?.response?.data?.message || "Failed to fulfill reservation");
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await LibraryService.cancelReservation(id);
            showSuccess("Reservation cancelled");
            fetchData();
        } catch {
            showError("Failed to cancel reservation");
        }
    };

    const handleCreateCopy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LibraryService.createBookCopy(copyForm);
            showSuccess("Book copy registered with barcode");
            setIsCopyOpen(false);
            setCopyForm({ bookId: "", barcode: "", accessionNumber: "" });
            fetchData();
        } catch (error: any) {
            showError(error?.response?.data?.message || "Failed to register copy");
        }
    };

    const handleBorrowByBarcode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LibraryService.borrowBookByBarcode(barcodeForm);
            showSuccess("Book issued via barcode scan");
            setBarcodeForm({ ...barcodeForm, barcode: "", studentId: "" });
            fetchData();
        } catch (error: any) {
            showError(error?.response?.data?.message || "Failed to borrow by barcode");
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "FULFILLED": return "bg-green-100 text-green-700";
            case "CANCELLED": return "bg-slate-200 text-slate-600";
            case "EXPIRED": return "bg-red-100 text-red-700";
            default: return "bg-muted text-foreground/60";
        }
    };

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "queue", label: "Reservation Queue", icon: Bookmark },
        { key: "copies", label: "Barcode & Copies", icon: ScanBarcode },
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
                            <Bookmark className="text-primary w-10 h-10" />
                            Reservations &amp; Copies
                        </h1>
                        <p className="text-foreground/60 font-medium text-[12px]">
                            Manage the reservation queue and track individual book copies by barcode.
                        </p>
                    </div>
                    <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20">
                                <Plus size={18} /> New Reservation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reserve a Book</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleReserve} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Book</Label>
                                    <select
                                        required
                                        className="w-full h-12 rounded-xl bg-white border border-primary/90 px-4 appearance-none"
                                        value={reserveForm.bookId}
                                        onChange={(e) => setReserveForm({ ...reserveForm, bookId: e.target.value })}
                                    >
                                        <option value="">Choose a book...</option>
                                        {books.map((b) => (
                                            <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Student</Label>
                                    <select
                                        required
                                        className="w-full h-12 rounded-xl bg-white border border-primary/90 px-4 appearance-none"
                                        value={reserveForm.studentId}
                                        onChange={(e) => setReserveForm({ ...reserveForm, studentId: e.target.value })}
                                    >
                                        <option value="">Choose a student...</option>
                                        {students.map((s) => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl font-semibold">
                                    Reserve Book
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex gap-2 border-b border-primary/20 pb-1">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${tab === t.key
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            <t.icon size={18} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "queue" && (
                    <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden">
                        <CardHeader className="px-3 pt-3">
                            <CardTitle className="text-[12px] font-semibold">Reservation Queue</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className={TABLE_ROOT}>
                                    <thead>
                                        <tr className={TABLE_HEADER}>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Book</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Student</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Reserved</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Expires</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {reservations.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Bookmark className="h-10 w-10 text-foreground/30" />
                                                        <p className="text-foreground/60 font-medium">No reservations yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reservations.map((r) => (
                                                <tr key={r.id} className={TABLE_ROW}>
                                                    <td className={TABLE_CELL_PRIMARY}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <BookOpen size={18} />
                                                            </div>
                                                            {r.book?.title || "Unknown Book"}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-foreground/60" />
                                                            {r.student?.firstName} {r.student?.lastName}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>
                                                        <div className="flex items-center gap-2 text-foreground/60">
                                                            <Clock size={14} /> {new Date(r.reservedAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className={TABLE_CELL}>{new Date(r.expiresAt).toLocaleDateString()}</td>
                                                    <td className={TABLE_CELL}>
                                                        <Badge className={`rounded-full font-semibold ${statusBadge(r.status)}`}>{r.status}</Badge>
                                                    </td>
                                                    <td className={TABLE_CELL_ACTIONS}>
                                                        {r.status === "PENDING" && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button size="sm" className="rounded-xl gap-1" onClick={() => handleFulfill(r.id)}>
                                                                    <CheckCircle2 size={14} /> Fulfill
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="rounded-xl gap-1 text-red-600" onClick={() => handleCancel(r.id)}>
                                                                    <XCircle size={14} /> Cancel
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {tab === "copies" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="rounded-2xl border-primary/20 shadow-xl">
                            <CardHeader className="px-3 pt-3">
                                <CardTitle className="text-[12px] font-semibold flex items-center gap-3">
                                    <ScanBarcode className="text-primary" size={20} /> Register Book Copy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3">
                                <form onSubmit={handleCreateCopy} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Book</Label>
                                        <select
                                            required
                                            className="w-full h-12 rounded-xl bg-white border border-primary/90 px-4 appearance-none"
                                            value={copyForm.bookId}
                                            onChange={(e) => setCopyForm({ ...copyForm, bookId: e.target.value })}
                                        >
                                            <option value="">Choose a book...</option>
                                            {books.map((b) => (
                                                <option key={b.id} value={b.id}>{b.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Barcode</Label>
                                        <Input
                                            required
                                            value={copyForm.barcode}
                                            onChange={(e) => setCopyForm({ ...copyForm, barcode: e.target.value })}
                                            placeholder="Scan or type barcode"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Accession Number</Label>
                                        <Input
                                            required
                                            value={copyForm.accessionNumber}
                                            onChange={(e) => setCopyForm({ ...copyForm, accessionNumber: e.target.value })}
                                            placeholder="e.g. ACC-00123"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-semibold">
                                        Register Copy
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-primary/20 shadow-xl">
                            <CardHeader className="px-3 pt-3">
                                <CardTitle className="text-[12px] font-semibold flex items-center gap-3">
                                    <ScanBarcode className="text-primary" size={20} /> Borrow By Barcode
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3">
                                <form onSubmit={handleBorrowByBarcode} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Barcode</Label>
                                        <Input
                                            required
                                            value={barcodeForm.barcode}
                                            onChange={(e) => setBarcodeForm({ ...barcodeForm, barcode: e.target.value })}
                                            placeholder="Scan copy barcode"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Student</Label>
                                        <select
                                            required
                                            className="w-full h-12 rounded-xl bg-white border border-primary/90 px-4 appearance-none"
                                            value={barcodeForm.studentId}
                                            onChange={(e) => setBarcodeForm({ ...barcodeForm, studentId: e.target.value })}
                                        >
                                            <option value="">Choose a student...</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={barcodeForm.dueDate}
                                            onChange={(e) => setBarcodeForm({ ...barcodeForm, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-semibold">
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

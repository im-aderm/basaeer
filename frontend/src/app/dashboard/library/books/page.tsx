"use client";

import { useState, useEffect } from "react";
import {
    Book,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Loader2,
    BookOpen,
    MapPin,
    Hash,
    Layers,
    Edit3,
    Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { LibraryService, Book as BookType } from "@/services/libraryService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BookCatalogPage() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [borrowData, setBorrowData] = useState({
        studentId: "",
        dueDate: ""
    });
    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        isbn: "",
        category: "",
        quantity: 1,
        location: "",
        description: ""
    });

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const [booksResponse, studentsData] = await Promise.all([
                LibraryService.getAllBooks({ page, limit: 9, search: searchTerm }),
                api.get("/students").then(res => res.data)
            ]);

            // Handle response format change (array vs { data, meta })
            if (Array.isArray(booksResponse)) {
                setBooks(booksResponse);
            } else {
                setBooks(booksResponse.data);
                setTotalPages(booksResponse.meta.totalPages);
            }

            setStudents(studentsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBooks();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    const handleQuickBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook) return;
        try {
            await LibraryService.borrowBook({
                bookId: selectedBook.id,
                studentId: borrowData.studentId,
                dueDate: borrowData.dueDate
            });
            setIsBorrowModalOpen(false);
            setBorrowData({ studentId: "", dueDate: "" });
            toast.success("Book borrowed successfully");
            fetchBooks();
        } catch (error) {
            console.error("Borrow failed:", error);
            toast.error("Failed to borrow book");
        }
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In a real app we'd get branchId from user context
            const branchId = books[0]?.branchId || "default-branch";
            await LibraryService.createBook({ ...newBook, branchId });
            setIsAddModalOpen(false);
            setNewBook({ title: "", author: "", isbn: "", category: "", quantity: 1, location: "", description: "" });
            fetchBooks();
        } catch (error) {
            console.error("Failed to add book:", error);
        }
    };

    if (loading && books.length === 0) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section with specialized design */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic">
                        <BookOpen className="text-blue-500 w-10 h-10" />
                        Book Catalog
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium italic">Explore and manage your school's library collection.</p>
                </div>
                <div className="relative z-10">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 truncate rounded-2xl px-10 font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3 bg-blue-600">
                                <Plus size={20} /> Register New Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic mb-6">Register New Book</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddBook} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Book Title</Label>
                                    <Input
                                        required
                                        className="rounded-xl h-12"
                                        placeholder="e.g. Advanced Calculus"
                                        value={newBook.title}
                                        onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Author</Label>
                                        <Input
                                            required
                                            className="rounded-xl h-12"
                                            placeholder="Author Name"
                                            value={newBook.author}
                                            onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Category</Label>
                                        <Input
                                            required
                                            className="rounded-xl h-12"
                                            placeholder="Mathematics"
                                            value={newBook.category}
                                            onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">ISBN</Label>
                                        <Input
                                            className="rounded-xl h-12"
                                            placeholder="Optional"
                                            value={newBook.isbn}
                                            onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Quantity</Label>
                                        <Input
                                            type="number"
                                            required
                                            min="1"
                                            className="rounded-xl h-12"
                                            value={newBook.quantity}
                                            onChange={e => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Storage Location</Label>
                                    <Input
                                        className="rounded-xl h-12"
                                        placeholder="Shelf A-1"
                                        value={newBook.location}
                                        onChange={e => setNewBook({ ...newBook, location: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg shadow-lg shadow-blue-500/20 bg-blue-600 mt-4">
                                    Complete Registration
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            {/* Filters shelf */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-[2rem] border border-border/50 items-center">
                <div className="relative group md:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 rounded-xl focus:border-blue-500 outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <select className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 rounded-xl focus:border-blue-500 outline-none appearance-none font-bold italic cursor-pointer">
                        <option value="">All Categories</option>
                        <option value="science">Science</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="literature">Literature</option>
                    </select>
                </div>
            </div>

            {/* Books Shelf Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {books.map((book) => (
                    <Card key={book.id} className="rounded-[2.5rem] border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-card border-t-8 border-t-blue-500/30 hover:border-t-blue-500">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-inner">
                                    <Book size={32} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`${book.available > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border-none font-black px-3 py-1 rounded-lg`}>
                                        {book.available > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                    </Badge>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">{book.category}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black italic truncate leading-tight group-hover:text-blue-600 transition-colors" title={book.title}>
                                    {book.title}
                                </h3>
                                <p className="text-muted-foreground font-bold italic">by {book.author}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-muted/50 space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                        <Layers size={12} /> Available
                                    </div>
                                    <p className="font-black text-lg">{book.available} / {book.quantity}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/50 space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                        <MapPin size={12} /> Location
                                    </div>
                                    <p className="font-black text-sm italic truncate">{book.location || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl font-black italic hover:bg-blue-500/10 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={book.available <= 0}
                                    onClick={() => {
                                        setSelectedBook(book);
                                        setIsBorrowModalOpen(true);
                                    }}
                                >
                                    Quick Borrow
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-muted/80">
                                    <Edit3 size={18} />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-500/10 hover:text-red-500">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-xl"
                    >
                        Previous
                    </Button>
                    <span className="flex items-center font-bold">Page {page} of {totalPages}</span>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-xl"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Quick Borrow Modal */}
            <Dialog open={isBorrowModalOpen} onOpenChange={setIsBorrowModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic mb-2">Quick Borrow</DialogTitle>
                        <p className="text-muted-foreground font-bold italic text-sm mb-6">Book: {selectedBook?.title}</p>
                    </DialogHeader>
                    <form onSubmit={handleQuickBorrow} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1 italic">Select Student</Label>
                            <select
                                required
                                className="w-full rounded-xl h-12 px-4 border bg-card font-bold italic"
                                value={borrowData.studentId}
                                onChange={e => setBorrowData({ ...borrowData, studentId: e.target.value })}
                            >
                                <option value="">Choose a student...</option>
                                {students.map((student: any) => (
                                    <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1 italic">Return Due Date</Label>
                            <Input
                                type="date"
                                required
                                className="rounded-xl h-12"
                                value={borrowData.dueDate}
                                onChange={e => setBorrowData({ ...borrowData, dueDate: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg shadow-lg shadow-blue-500/20 bg-blue-600 mt-4">
                            Confirm Borrow
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {books.length === 0 && !loading && (
                <div className="py-24 text-center bg-card border-2 border-dashed border-border/50 rounded-[3rem] animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-muted-foreground/30" />
                    </div>
                    <h2 className="text-2xl font-black italic">No books match your search</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium italic leading-relaxed">Try adjusting your filters or use different search terms to find what you need.</p>
                </div>
            )}
        </div>
    );
}

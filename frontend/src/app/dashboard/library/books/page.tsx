"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Trash2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from "@/lib/table-styles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LibraryService, Book as BookType } from "@/services/libraryService";
import api from "@/lib/api";

export default function LibraryBooksPage() {
    const { showSuccess, showError } = useNotification();
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
    const [form, setForm] = useState({
        title: "",
        author: "",
        isbn: "",
        category: "",
        quantity: 1,
        description: "",
    });

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await LibraryService.getAllBooks({ search });
            setBooks(Array.isArray(data) ? data : data.data);
        } catch {
            showError("Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchBooks, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LibraryService.createBook({
                title: form.title,
                author: form.author,
                isbn: form.isbn,
                category: form.category,
                quantity: form.quantity,
                description: form.description,
            });
            setIsAddOpen(false);
            setForm({ title: "", author: "", isbn: "", category: "", quantity: 1, description: "" });
            showSuccess("Book added successfully");
            fetchBooks();
        } catch {
            showError("Failed to add book");
        }
    };

    const handleDelete = async (id: string, title: string) => {
        setConfirmDelete({ id, title });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/library/books/${confirmDelete.id}`);
            showSuccess("Book deleted successfully");
            fetchBooks();
        } catch {
            showError("Failed to delete book");
        } finally {
            setConfirmDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="space-y-6">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Library Books</h1>
                    <p className="text-foreground/60 text-sm mt-1">Manage your school&apos;s book inventory</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Book
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Book</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Book title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        required
                                        value={form.author}
                                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                                        placeholder="Author name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="isbn">ISBN</Label>
                                    <Input
                                        id="isbn"
                                        value={form.isbn}
                                        onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        required
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        placeholder="e.g. Fiction, Science"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min={1}
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief description (optional)"
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Book</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                <Input
                    placeholder="Search by title..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="px-3 py-2">
                    <CardTitle className="text-[12px] font-semibold">All Books</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " w-10"}></th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Title</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Author</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>ISBN</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Category</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Available / Total</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {books.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-foreground/60">
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="h-8 w-8 text-foreground/30" />
                                                <p>No books found{search ? " matching your search" : ""}.</p>
                                                {!search && (
                                                    <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                                                        Add your first book
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    books.map((book) => (
                                        <>
                                            <tr
                                                key={book.id}
                                                className={TABLE_ROW + " cursor-pointer"}
                                                onClick={() => setExpandedId(expandedId === book.id ? null : book.id)}
                                            >
                                                <td className={TABLE_CELL}>
                                                    {expandedId === book.id ? (
                                                        <ChevronDown className="h-4 w-4 text-foreground/60" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-foreground/60" />
                                                    )}
                                                </td>
                                                <td className={TABLE_CELL_PRIMARY}>{book.title}</td>
                                                <td className={TABLE_CELL}>{book.author}</td>
                                                <td className={TABLE_CELL + " font-mono"}>{book.isbn || "—"}</td>
                                                <td className={TABLE_CELL}>
                                                    <Badge variant="secondary" className="rounded-md font-normal text-[12px]">
                                                        {book.category}
                                                    </Badge>
                                                </td>
                                                <td className={TABLE_CELL}>
                                                    <span className={book.available > 0 ? "text-primary font-semibold" : "text-red-600 font-semibold"}>
                                                        {book.available}
                                                    </span>
                                                    <span className="text-foreground/60"> / {book.quantity}</span>
                                                </td>
                                                <td className={TABLE_CELL_ACTIONS}>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(book.id, book.title);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                            {expandedId === book.id && (
                                                <tr key={`${book.id}-detail`}>
                                                    <td colSpan={7} className="bg-muted/30 px-3 py-1.5">
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                                                            <div>
                                                                <span className="text-foreground/60 block text-[10px] uppercase tracking-wide mb-1">Location</span>
                                                                <span className="font-medium">{book.location || "Not specified"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-foreground/60 block text-[10px] uppercase tracking-wide mb-1">Added</span>
                                                                <span className="font-medium">{new Date(book.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-foreground/60 block text-[10px] uppercase tracking-wide mb-1">Branch ID</span>
                                                                <span className="font-mono text-[12px]">{book.branchId}</span>
                                                            </div>
                                                            {book.description && (
                                                                <div className="sm:col-span-3">
                                                                    <span className="text-foreground/60 block text-[10px] uppercase tracking-wide mb-1">Description</span>
                                                                    <span className="font-medium">{book.description}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>

        <ConfirmDialog
            isOpen={!!confirmDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
            title="Delete Book"
            message={`Delete "${confirmDelete?.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
        />
    </RequireBranch>
    );
}

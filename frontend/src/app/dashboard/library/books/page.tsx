"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Trash2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LibraryService, Book as BookType } from "@/services/libraryService";
import api from "@/lib/api";

export default function LibraryBooksPage() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
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
            toast.error("Failed to load books");
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
            toast.success("Book added successfully");
            fetchBooks();
        } catch {
            toast.error("Failed to add book");
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
        try {
            await api.delete(`/library/books/${id}`);
            toast.success("Book deleted successfully");
            fetchBooks();
        } catch {
            toast.error("Failed to delete book");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Library Books</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your school&apos;s book inventory</p>
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Books</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>ISBN</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Available / Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No books found{search ? " matching your search" : ""}.</p>
                                                {!search && (
                                                    <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                                                        Add your first book
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    books.map((book) => (
                                        <>
                                            <TableRow
                                                key={book.id}
                                                className="cursor-pointer"
                                                onClick={() => setExpandedId(expandedId === book.id ? null : book.id)}
                                            >
                                                <TableCell>
                                                    {expandedId === book.id ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{book.title}</TableCell>
                                                <TableCell>{book.author}</TableCell>
                                                <TableCell className="font-mono text-xs">{book.isbn || "—"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="rounded-md font-normal">
                                                        {book.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={book.available > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                        {book.available}
                                                    </span>
                                                    <span className="text-muted-foreground"> / {book.quantity}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                                </TableCell>
                                            </TableRow>
                                            {expandedId === book.id && (
                                                <TableRow key={`${book.id}-detail`}>
                                                    <TableCell colSpan={7} className="bg-muted/30 px-10 py-6">
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground block text-xs uppercase tracking-wide mb-1">Location</span>
                                                                <span className="font-medium">{book.location || "Not specified"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground block text-xs uppercase tracking-wide mb-1">Added</span>
                                                                <span className="font-medium">{new Date(book.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground block text-xs uppercase tracking-wide mb-1">Branch ID</span>
                                                                <span className="font-mono text-xs">{book.branchId}</span>
                                                            </div>
                                                            {book.description && (
                                                                <div className="sm:col-span-3">
                                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide mb-1">Description</span>
                                                                    <span className="font-medium">{book.description}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </RequireBranch>
    );
}

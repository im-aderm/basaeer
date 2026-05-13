"use client";

import { useState, useEffect } from "react";
import { BookOpen, Layers, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LibraryService, Book as BookType } from "@/services/libraryService";
import Link from "next/link";

interface CategoryGroup {
    name: string;
    count: number;
    books: BookType[];
}

export default function LibraryCategoryPage() {
    const [categories, setCategories] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await LibraryService.getAllBooks({ limit: 1000 });
                const books: BookType[] = Array.isArray(data) ? data : data.data;
                const map = new Map<string, BookType[]>();
                for (const book of books) {
                    const cat = book.category || "Uncategorized";
                    if (!map.has(cat)) map.set(cat, []);
                    map.get(cat)!.push(book);
                }
                const grouped: CategoryGroup[] = [];
                for (const [name, list] of map) {
                    grouped.push({ name, count: list.length, books: list });
                }
                grouped.sort((a, b) => b.count - a.count);
                setCategories(grouped);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
                        <BookOpen className="text-primary w-10 h-10" />
                        Book Categories
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Browse books grouped by category.
                    </p>
                </div>
            </div>

            {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <Layers size={40} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-h3 font-semibold tracking-tight">No Categories Found</h3>
                    <p className="text-muted-foreground font-medium mt-2 max-w-md">
                        Categories will appear here once books are added to the library.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link key={cat.name} href={`/dashboard/library/books?category=${encodeURIComponent(cat.name)}`}>
                            <Card className="rounded-[2rem] border-border/50 shadow-xl hover:shadow-2xl transition-all group bg-card/50 backdrop-blur-sm hover:scale-[1.02] cursor-pointer border-t-8 border-t-primary/20 overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Layers size={28} />
                                        </div>
                                        <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight mb-1">{cat.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {cat.count} {cat.count === 1 ? "book" : "books"}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

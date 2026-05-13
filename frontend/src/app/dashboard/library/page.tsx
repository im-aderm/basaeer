"use client";

import { useState, useEffect } from "react";
import {
    Book,
    Bookmark,
    History,
    AlertCircle,
    Plus,
    Search,
    BookOpen,
    UserPlus,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LibraryService, Book as BookType, BorrowRecord } from "@/services/libraryService";
import Link from "next/link";

export default function LibraryOverviewPage() {
    const [statsData, setStatsData] = useState<any>(null);
    const [overdue, setOverdue] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [libraryStats, overdueData] = await Promise.all([
                    LibraryService.getLibraryStats(),
                    LibraryService.getOverdueBooks()
                ]);
                setStatsData(libraryStats);
                setOverdue(overdueData);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error("Failed to fetch library data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        {
            title: "Total Books",
            value: statsData?.totalBooks || 0,
            icon: Book,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            description: "Total titles in catalog"
        },
        {
            title: "Borrowed",
            value: statsData?.borrowedBooks || 0,
            icon: Bookmark,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            description: "Currently with students"
        },
        {
            title: "Overdue",
            value: statsData?.overdueBooks || 0,
            icon: AlertCircle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            description: "Delayed returns"
        },
        {
            title: "Available",
            value: statsData?.availableBooks || 0,
            icon: BookOpen,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            description: "Books on shelf"
        }
    ];

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header section with glassmorphism */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-primary p-12 text-white shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                    <h1 className="text-h1 font-semibold tracking-tight mb-4">Library Hub</h1>
                    <p className="text-primary-foreground/80 text-xl font-medium max-w-2xl leading-relaxed">
                        Manage your school's literary resources, track borrowings, and maintain a seamless reading experience for students.
                    </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between">
                                <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={28} />
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-h1 font-semibold tracking-tighter">{stat.value}</h3>
                                <p className="text-muted-foreground font-bold mt-1">{stat.title}</p>
                                <p className="text-label text-muted-foreground/50 mt-4">{stat.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/dashboard/library/books">
                            <Card className="rounded-[3rem] p-8 border-border/50 shadow-xl hover:shadow-2xl transition-all group bg-gradient-to-br from-card to-muted/30 cursor-pointer h-full border-t-8 border-t-blue-500">
                                <h3 className="text-h3 font-semibold flex items-center justify-between">
                                    Book Catalog <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </h3>
                                <p className="text-muted-foreground font-medium mt-2 text-sm">Explore and manage the entire library book collection.</p>
                                <div className="mt-8 flex gap-2">
                                    <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-semibold uppercase">Search</div>
                                    <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-semibold uppercase">Edit</div>
                                    <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-semibold uppercase">Delete</div>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/dashboard/library/borrowing">
                            <Card className="rounded-[3rem] p-8 border-border/50 shadow-xl hover:shadow-2xl transition-all group bg-gradient-to-br from-card to-muted/30 cursor-pointer h-full border-t-8 border-t-purple-500">
                                <h3 className="text-h3 font-semibold flex items-center justify-between">
                                    Borrowing & Returns <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </h3>
                                <p className="text-muted-foreground font-medium mt-2 text-sm">Handle check-outs, returns, and track due dates.</p>
                                <div className="mt-8 flex gap-2">
                                    <div className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-xs font-semibold uppercase">Issue</div>
                                    <div className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-xs font-semibold uppercase">History</div>
                                </div>
                            </Card>
                        </Link>
                    </div>

                    <Card className="rounded-[3rem] border-border/50 shadow-xl p-10 bg-card/50 overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-h3 font-semibold flex items-center gap-3">
                                <AlertCircle className="text-red-500" /> Overdue Alerts
                            </h3>
                            <Button variant="ghost" className="font-semibold rounded-xl">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {overdue.length > 0 ? overdue.slice(0, 5).map(record => (
                                <div key={record.id} className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                            <Bookmark size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{record.book?.title}</p>
                                            <p className="text-xs font-bold text-muted-foreground">Borrowed by: {record.student?.firstName} {record.student?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold uppercase text-red-500">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                                        <Button size="sm" variant="outline" className="h-8 mt-2 rounded-lg text-[10px] font-semibold uppercase">Notify</Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-muted-foreground font-bold">
                                    No overdue records found. Everything is on schedule!
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="rounded-[3rem] border-border/50 shadow-xl p-8 bg-primary/5 border-t-8 border-t-primary">
                        <h3 className="text-h3 font-semibold mb-6">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link href="/dashboard/library/books">
                                <Button className="w-full h-16 rounded-2xl font-semibold justify-start gap-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                    <Plus size={24} /> Register New Book
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full h-16 rounded-2xl font-semibold justify-start gap-4 hover:bg-primary/10 hover:text-primary transition-all border-2">
                                <UserPlus size={24} /> New Membership
                            </Button>
                            <Button variant="outline" className="w-full h-16 rounded-2xl font-semibold justify-start gap-4 hover:bg-primary/10 hover:text-primary transition-all border-2">
                                <Search size={24} /> Book Search
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[3rem] border-border/50 shadow-xl p-8 bg-card/50">
                        <h3 className="text-h3 font-semibold mb-6 flex items-center gap-3">
                            <History className="text-muted-foreground" /> Recent Activity
                        </h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                    <div>
                                        <p className="text-sm font-bold leading-tight">"Advanced Mathematics" returned by John Doe.</p>
                                        <p className="text-[10px] font-semibold uppercase text-muted-foreground mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

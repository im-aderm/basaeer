'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { EventsService, CampusEvent } from '@/services/eventsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Calendar,
    MapPin,
    AlertCircle,
    ArrowUpDown
} from 'lucide-react';
import {
    TABLE_ROOT,
    TABLE_HEADER,
    TABLE_HEADER_CELL,
    TABLE_HEADER_CELL_NO_SORT,
    TABLE_BODY,
    TABLE_ROW,
    TABLE_CELL,
    TABLE_CELL_ACTIONS,
    PAGINATION_BAR,
    PAGINATION_INFO,
    PAGINATION_BUTTON,
    PAGINATION_BUTTON_ACTIVE
} from '@/lib/table-styles';

export default function EventsAdminPage() {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Search, Filter, Sort and Paginate state
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortField, setSortField] = useState<keyof CampusEvent>('startDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await EventsService.getEvents();
            setEvents(data);
        } catch (error) {
            showError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? This will also delete all packages, schedules, and applications related to it.')) {
            return;
        }
        try {
            await EventsService.deleteEvent(id);
            showSuccess('Event deleted successfully');
            fetchEvents();
        } catch (error) {
            showError('Failed to delete event');
        }
    };

    // Sorting trigger
    const handleSort = (field: keyof CampusEvent) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Filter & search events
    const processedEvents = useMemo(() => {
        return events
            .filter(e => {
                const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesCategory = categoryFilter === 'ALL' || e.categoryLabel === categoryFilter;
                const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
                return matchesSearch && matchesCategory && matchesStatus;
            })
            .sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return sortDirection === 'asc' ? cmp : -cmp;
            });
    }, [events, searchTerm, categoryFilter, statusFilter, sortField, sortDirection]);

    // Paginated events
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedEvents.slice(start, start + pageSize);
    }, [processedEvents, currentPage]);

    const totalPages = Math.ceil(processedEvents.length / pageSize);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] py-0 px-2 rounded font-bold uppercase">Active</Badge>;
            case 'DRAFT':
                return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] py-0 px-2 rounded font-bold uppercase">Draft</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] py-0 px-2 rounded font-bold uppercase">Completed</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] py-0 px-2 rounded font-bold uppercase">Cancelled</Badge>;
            default:
                return <Badge className="bg-muted text-muted-foreground text-[10px] py-0 px-2 rounded font-bold uppercase">{status}</Badge>;
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">All Events</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Manage branch programs, packages, schedules, and view registrations.</p>
                    </div>
                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
                        <Link href="/dashboard/events/create">
                            <Button className="h-10 px-5 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/10">
                                <Plus className="h-4.5 w-4.5" /> Create Event
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters Board */}
                <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-3.5 rounded-2xl border border-primary/10 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by event title or location..."
                            className="pl-10 h-10 rounded-xl bg-muted/20 border-primary/10 font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                        <select
                            className="h-10 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer"
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Categories</option>
                            <option value="CAMP">Camps</option>
                            <option value="CONFERENCE">Conferences</option>
                            <option value="COMPETITION">Competitions</option>
                            <option value="WORKSHOP">Workshops</option>
                            <option value="EXCURSION">Excursions</option>
                            <option value="SUMMER_PROGRAM">Summer Programs</option>
                            <option value="TAHFIZ_PROGRAM">Tahfiz Programs</option>
                            <option value="ACADEMIC_PROGRAM">Academic Programs</option>
                            <option value="OTHERS">Others</option>
                        </select>
                        <select
                            className="h-10 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Compact Events Table */}
                <div className="overflow-x-auto rounded-xl border border-primary/20 bg-card shadow-sm">
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL + " w-[25%]"} onClick={() => handleSort('title')}>
                                    Event Name <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[12%]"}>Category</th>
                                <th className={TABLE_HEADER_CELL + " w-[10%]"} onClick={() => handleSort('status')}>
                                    Status <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-center"}>Applications</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-right"}>Revenue</th>
                                <th className={TABLE_HEADER_CELL + " w-[18%]"} onClick={() => handleSort('startDate')}>
                                    Dates <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[8%] text-center"}>Public</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[12%] text-right"}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Loading events...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="h-8 w-8 opacity-30 text-primary" />
                                            <span>No events found matching current criteria.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedEvents.map((event) => {
                                    // Calculate total revenue for verified applications
                                    const appCount = event._count?.applications || 0;
                                    const startStr = new Date(event.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
                                    const endStr = new Date(event.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
                                    
                                    return (
                                        <tr key={event.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL + " font-semibold text-foreground"}>
                                                <Link href={`/dashboard/events/${event.id}/edit`} className="hover:text-primary hover:underline transition block">
                                                    <div className="truncate" title={event.title}>{event.title}</div>
                                                </Link>
                                            </td>
                                            <td className={TABLE_CELL}>{event.categoryLabel.replace('_', ' ')}</td>
                                            <td className={TABLE_CELL}>{getStatusBadge(event.status)}</td>
                                            <td className={TABLE_CELL + " text-center font-semibold"}>
                                                {appCount > 0 ? (
                                                    <Link href={`/dashboard/events/applications?eventId=${event.id}`} className="text-primary hover:underline">
                                                        {appCount} Applications
                                                    </Link>
                                                ) : '0'}
                                            </td>
                                            <td className={TABLE_CELL + " text-right font-semibold"}>
                                                {/* Revenue placeholder or calculated based on backend return if verified */}
                                                {/* Since we calculate it in analytics, let's display NGN or similar */}
                                                NGN {Number(event.packages?.[0]?.fee || 0).toLocaleString([], { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <span className="truncate">{startStr} - {endStr}</span>
                                            </td>
                                            <td className={TABLE_CELL + " text-center"}>
                                                {event.isPublic ? (
                                                    <Badge className="bg-blue-50/50 text-blue-600 border border-blue-200 text-[9px] font-semibold py-0.5 rounded">Yes</Badge>
                                                ) : (
                                                    <Badge className="bg-muted text-muted-foreground text-[9px] font-semibold py-0.5 rounded">No</Badge>
                                                )}
                                            </td>
                                            <td className={TABLE_CELL_ACTIONS}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link href={`/events/${event.slug}`} target="_blank" title="View Public Page">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded">
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/events/${event.id}/edit`} title="Edit Event">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                                                            onClick={() => handleDelete(event.id)}
                                                            title="Delete Event"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={PAGINATION_BAR}>
                        <p className={PAGINATION_INFO}>
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedEvents.length)} of {processedEvents.length} events
                        </p>
                        <div className="flex items-center space-x-1">
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={PAGINATION_BUTTON + " h-8"}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={(page === currentPage ? PAGINATION_BUTTON_ACTIVE : PAGINATION_BUTTON) + " h-8 w-8 p-0"}
                                    variant={page === currentPage ? 'default' : 'outline'}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={PAGINATION_BUTTON + " h-8"}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </RequireBranch>
    );
}

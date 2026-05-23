'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, User, Users, Package, Calendar, Loader2, ArrowRight, BookOpen, Receipt, Home, GraduationCap } from 'lucide-react';
import { searchService, SearchResults } from '@/services/searchService';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const iconMap: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    students: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: User },
    staff: { bg: 'bg-primary/10', text: 'text-primary', icon: Users },
    inventory: { bg: 'bg-primary/10', text: 'text-primary', icon: Package },
    books: { bg: 'bg-primary/10', text: 'text-primary', icon: BookOpen },
    invoices: { bg: 'bg-primary/10', text: 'text-primary', icon: Receipt },
    hostel: { bg: 'bg-primary/10', text: 'text-primary', icon: Home },
    classes: { bg: 'bg-primary/10', text: 'text-primary', icon: GraduationCap },
    events: { bg: 'bg-primary/10', text: 'text-primary', icon: Calendar },
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults(null);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await searchService.globalSearch(query);
                    setResults(data);
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleNavigate = useCallback((path: string) => {
        router.push(path);
        onClose();
    }, [router, onClose]);

    const sections: { key: keyof SearchResults; label: string; getLink: (item: any) => string }[] = [
        { key: 'students', label: 'Students', getLink: (s) => `/dashboard/students/${s.id}` },
        { key: 'staff', label: 'Staff', getLink: (s) => `/dashboard/employees/${s.id}` },
        { key: 'inventory', label: 'Inventory', getLink: () => '/dashboard/inventory' },
        { key: 'books', label: 'Books', getLink: () => '/dashboard/library/books' },
        { key: 'invoices', label: 'Invoices', getLink: () => '/dashboard/finance/invoices' },
        { key: 'hostel', label: 'Hostels', getLink: () => '/dashboard/hostels' },
        { key: 'classes', label: 'Classes', getLink: (c) => `/dashboard/academics/classes` },
        { key: 'events', label: 'Events', getLink: () => '/dashboard/events' },
    ];

    const hasResults = results && sections.some((s) => (results[s.key] as any[]).length > 0);

    const getSub = (key: string, item: any): string => {
        switch (key) {
            case 'students': return item.email || '';
            case 'staff': return `${item.role} · ${item.email}`;
            case 'inventory': return `Stock: ${item.stock}`;
            case 'books': return `${item.author}${item.isbn ? ` · ${item.isbn}` : ''}`;
            case 'invoices': return `${item.invoiceNumber} · ${item.student ? `${item.student.firstName} ${item.student.lastName}` : ''} · ${item.status}`;
            case 'hostel': return `${item.type}`;
            case 'classes': return item.gradeLevel ? `Grade ${item.gradeLevel}` : '';
            case 'events': return new Date(item.eventDate).toLocaleDateString();
            default: return '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Global search"
                >
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="relative w-full max-w-2xl bg-white/75 border border-border/50 shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 p-5 border-b border-border/50">
                            <Search className="w-5 h-5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search students, staff, classes, inventory, books..."
                                className="flex-1 bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground/40 font-medium"
                                aria-label="Search query"
                            />
                            {loading && <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" aria-label="Searching..." />}
                            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 rounded border border-border/50 font-mono">ESC</kbd>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                aria-label="Close search"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-96 overflow-y-auto p-2" role="listbox" aria-label="Search results">
                            {query.length < 2 && (
                                <div className="p-10 text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                                        <Search className="w-7 h-7 text-primary/40" aria-hidden="true" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">Search the portal</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                                        Type at least <span className="font-semibold text-foreground/60">2 characters</span> to find students, staff, classes, inventory items, and more
                                    </p>
                                </div>
                            )}

                            {query.length >= 2 && !loading && !hasResults && (
                                <div className="p-10 text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                                        <Search className="w-7 h-7 text-muted-foreground/30" aria-hidden="true" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">No results found</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        No matches for &ldquo;<span className="font-medium text-foreground/60">{query}</span>&rdquo;
                                    </p>
                                </div>
                            )}

                            {results && (
                                <div className="space-y-4">
                                    {sections.map(({ key, label, getLink }) => {
                                        const items = results[key] as any[];
                                        if (items.length === 0) return null;
                                        const meta = iconMap[key];

                                        return (
                                            <div key={key}>
                                                <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                                                    {label}
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {items.map((item: any) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleNavigate(getLink(item))}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/5 rounded-xl transition-all text-left group"
                                                            role="option"
                                                        >
                                                            <div className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.text} flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                                                                <meta.icon className="w-4 h-4" aria-hidden="true" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm text-foreground truncate">
                                                                    {key === 'students' && `${item.firstName} ${item.lastName}`}
                                                                    {key === 'staff' && `${item.firstName} ${item.lastName}`}
                                                                    {key === 'inventory' && item.name}
                                                                    {key === 'books' && item.title}
                                                                    {key === 'invoices' && item.invoiceNumber}
                                                                    {key === 'hostel' && item.name}
                                                                    {key === 'classes' && item.name}
                                                                    {key === 'events' && item.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground/60 truncate">
                                                                    {getSub(key, item)}
                                                                </p>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

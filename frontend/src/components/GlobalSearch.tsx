'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Users, Package, Calendar, Loader2 } from 'lucide-react';
import { searchService, SearchResults } from '@/services/searchService';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

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

    // Keyboard shortcut: Ctrl+K / Cmd+K to open; Escape to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await searchService.globalSearch(query);
                    setResults(data);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleNavigate = (path: string) => {
        router.push(path);
        onClose();
    };

    if (!isOpen) return null;

    const hasResults = results && (
        results.students.length > 0 ||
        results.staff.length > 0 ||
        results.inventory.length > 0 ||
        results.events.length > 0
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search students, staff, inventory, events..."
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                        aria-label="Search query"
                    />
                    {loading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" aria-label="Searching..." />}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                        aria-label="Close search"
                    >
                        <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto" role="listbox" aria-label="Search results">
                    {query.length < 2 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                            <p className="text-sm font-medium">Type at least 2 characters to search</p>
                            <p className="text-xs mt-2 text-muted-foreground">
                                Press{' '}
                                <kbd className="px-2 py-0.5 bg-muted rounded text-xs border border-border font-mono">Ctrl+K</kbd>
                                {' '}to toggle
                            </p>
                        </div>
                    )}

                    {query.length >= 2 && !loading && !hasResults && (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                            <p className="text-sm font-medium">No results found for &quot;{query}&quot;</p>
                        </div>
                    )}

                    {results && (
                        <div className="p-2 space-y-4">
                            {/* Students */}
                            {results.students.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Students
                                    </h3>
                                    <div className="space-y-1">
                                        {results.students.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => handleNavigate(`/dashboard/students/${student.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                                                role="option"
                                                aria-selected="false"
                                            >
                                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                                                    <User className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground text-sm truncate">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    {student.email && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {student.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Staff */}
                            {results.staff.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Staff
                                    </h3>
                                    <div className="space-y-1">
                                        {results.staff.map((staff) => (
                                            <button
                                                key={staff.id}
                                                onClick={() => handleNavigate(`/dashboard/hr/staff/${staff.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                                                role="option"
                                                aria-selected="false"
                                            >
                                                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg shrink-0">
                                                    <Users className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground text-sm truncate">
                                                        {staff.firstName} {staff.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {staff.role} • {staff.email}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Inventory */}
                            {results.inventory.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Inventory
                                    </h3>
                                    <div className="space-y-1">
                                        {results.inventory.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavigate('/dashboard/inventory')}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                                                role="option"
                                                aria-selected="false"
                                            >
                                                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg shrink-0">
                                                    <Package className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground text-sm truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Stock: {item.stock}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Events */}
                            {results.events.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Events
                                    </h3>
                                    <div className="space-y-1">
                                        {results.events.map((event) => (
                                            <button
                                                key={event.id}
                                                onClick={() => handleNavigate('/dashboard/events')}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                                                role="option"
                                                aria-selected="false"
                                            >
                                                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg shrink-0">
                                                    <Calendar className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground text-sm truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(event.startDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

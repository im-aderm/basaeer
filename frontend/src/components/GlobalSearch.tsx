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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // This would be triggered from parent
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search students, staff, inventory, events..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {query.length < 2 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Type at least 2 characters to search</p>
                            <p className="text-sm mt-2">
                                Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd> to toggle
                            </p>
                        </div>
                    )}

                    {query.length >= 2 && !loading && !hasResults && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No results found for &quot;{query}&quot;</p>
                        </div>
                    )}

                    {results && (
                        <div className="p-2 space-y-4">
                            {/* Students */}
                            {results.students.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Students
                                    </h3>
                                    <div className="space-y-1">
                                        {results.students.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => handleNavigate(`/dashboard/students/${student.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                            >
                                                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    {student.email && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Staff
                                    </h3>
                                    <div className="space-y-1">
                                        {results.staff.map((staff) => (
                                            <button
                                                key={staff.id}
                                                onClick={() => handleNavigate(`/dashboard/hr/staff/${staff.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                            >
                                                <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {staff.firstName} {staff.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Inventory
                                    </h3>
                                    <div className="space-y-1">
                                        {results.inventory.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavigate(`/dashboard/inventory`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                            >
                                                <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Events
                                    </h3>
                                    <div className="space-y-1">
                                        {results.events.map((event) => (
                                            <button
                                                key={event.id}
                                                onClick={() => handleNavigate(`/dashboard/campus/events`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                            >
                                                <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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

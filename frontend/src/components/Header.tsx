"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Bell, Search, User, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import GlobalSearch from "@/components/GlobalSearch";
import BranchSelector from "@/components/BranchSelector";
import SessionSelector from "@/components/SessionSelector";
import { useRealtimeEvent } from "@/hooks/useRealtime";
import { useNotification } from '@/context/NotificationContext';
import { useSidebarStore } from "@/stores/sidebarStore";

export function Header() {
    const { user, logout } = useAuth();
    const { showInfo } = useNotification();
    const { isCollapsed, toggle } = useSidebarStore();
    const [searchOpen, setSearchOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close profile menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [profileMenuOpen]);

    // Global keyboard shortcut: Ctrl+K / Cmd+K to open search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNotification = useCallback((data: any) => {
        setUnreadCount((prev) => prev + 1);
        showInfo(data.title || "New Notification");
    }, []);

    useRealtimeEvent("notification", handleNotification);

    return (
        <>
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 gap-4 w-full">
                <button
                    onClick={toggle}
                    className="hidden md:inline-flex p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
                <div className="flex-1 flex items-center gap-4">
                    {/* Search trigger — opens GlobalSearch modal */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="relative w-full max-w-2xl group flex items-center gap-3 h-10 px-3 bg-white/50 border border-border/50 rounded-xl hover:bg-white hover:border-primary/30 transition-all cursor-pointer text-left card-hover"
                        aria-label="Open search (Ctrl+K)"
                        title="Search (Ctrl+K)"
                    >
                        <Search
                            className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                            size={18}
                            aria-hidden="true"
                        />
                        <span className="text-sm text-muted-foreground font-medium flex-1">Search anything...</span>
                        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border/50">
                            Ctrl K
                        </kbd>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Branch Selector */}
                    <BranchSelector />

                    {/* Session Selector */}
                    <SessionSelector />

                    {/* Notifications Bell */}
                    <button
                        onClick={() => setUnreadCount(0)}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all relative"
                        aria-label="Notifications"
                    >
                        <Bell size={20} aria-hidden="true" />
                        {unreadCount > 0 && (
                            <span
                                className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-[10px] font-bold text-white rounded-full border-2 border-background animate-in zoom-in duration-300"
                                aria-label={`${unreadCount} new notifications`}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>



                    <div className="h-8 w-[1px] bg-border mx-2" aria-hidden="true" />

                    {/* User Profile + Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-foreground">{user?.firstName} {user?.lastName}</p>
                                <p className="text-label">{user?.role?.replace(/_/g, ' ')}</p>
                            </div>

                            <div ref={profileMenuRef} className="relative">
                                <div
                                    onClick={() => setProfileMenuOpen(prev => !prev)}
                                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer overflow-hidden"
                                >
                                    {user?.firstName ? (
                                        <span className="text-sm" aria-hidden="true">{user.firstName[0]}{user.lastName?.[0]}</span>
                                    ) : (
                                        <User size={20} aria-hidden="true" />
                                    )}
                                </div>

                                {/* Dropdown */}
                                <div className={`absolute top-12 right-0 w-52 bg-white border border-border shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl p-2 transition-all z-50 translate-y-2 ${profileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible'}`}>
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 text-foreground hover:bg-muted rounded-lg transition-colors font-semibold text-sm"
                                    >
                                        <User size={16} aria-hidden="true" />
                                        Edit Profile
                                    </Link>
                                    <hr className="my-1 border-border/50" />
                                    <button
                                        onClick={() => { logout(); setProfileMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold text-sm"
                                        aria-label="Sign out"
                                    >
                                        <LogOut size={16} aria-hidden="true" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Global Search Modal */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}

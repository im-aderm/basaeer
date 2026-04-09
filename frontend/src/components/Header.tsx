"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Bell, Search, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import GlobalSearch from "@/components/GlobalSearch";

export function Header() {
    const { user, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering the toggle after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 gap-6 w-full">
                <div className="flex-1 flex items-center gap-4">
                    {/* Search trigger — opens GlobalSearch modal */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="relative w-full max-w-2xl group flex items-center gap-3 h-10 px-3 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer text-left"
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

                <div className="flex items-center gap-2">
                    {/* Notifications Bell */}
                    <button
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all relative"
                        aria-label="Notifications"
                    >
                        <Bell size={20} aria-hidden="true" />
                        <span
                            className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"
                            aria-label="New notifications available"
                        />
                    </button>

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    )}

                    <div className="h-8 w-[1px] bg-border mx-2" aria-hidden="true" />

                    {/* User Profile + Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-foreground">{user?.firstName} {user?.lastName}</p>
                                <p className="text-label">{user?.role?.replace(/_/g, ' ')}</p>
                            </div>

                            <div className="group relative">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer overflow-hidden">
                                    {user?.firstName ? (
                                        <span className="text-sm" aria-hidden="true">{user.firstName[0]}{user.lastName?.[0]}</span>
                                    ) : (
                                        <User size={20} aria-hidden="true" />
                                    )}
                                </div>

                                {/* Dropdown logout */}
                                <button
                                    onClick={logout}
                                    className="absolute top-12 right-0 w-48 bg-white border border-border shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-2 group-hover:translate-y-0"
                                    aria-label="Sign out"
                                >
                                    <div className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold text-sm">
                                        <LogOut size={18} aria-hidden="true" />
                                        Sign Out
                                    </div>
                                </button>
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

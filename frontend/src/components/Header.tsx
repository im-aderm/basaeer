"use client";

import { useAuth } from "@/context/AuthContext";
// import { ThemeToggle } from "@/components/ThemeToggle"; // Removed
import { LogOut, Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 gap-6 w-full">
            <div className="flex-1 flex items-center gap-4">
                <div className="relative w-full max-w-2xl group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                        placeholder="Search anything..."
                        className="pl-10 h-10 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </button>

                <div className="h-8 w-[1px] bg-border mx-2"></div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-black tracking-tight">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-primary/70">{user?.role?.replace('_', ' ')}</p>
                        </div>

                        <div className="group relative">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer overflow-hidden">
                                {user?.firstName ? (
                                    <span className="text-sm">{user.firstName[0]}{user.lastName[0]}</span>
                                ) : (
                                    <User size={20} />
                                )}
                            </div>

                            {/* Simple Dropdown simulation or just logout for now */}
                            <button
                                onClick={logout}
                                className="absolute top-12 right-0 w-48 bg-white border border-border shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-2 group-hover:translate-y-0"
                            >
                                <div className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold text-sm">
                                    <LogOut size={18} />
                                    Sign Out
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

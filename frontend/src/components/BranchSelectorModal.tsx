"use client";

import { useState } from "react";
import { useAuth, AuthBranch } from "@/context/AuthContext";
import { Building2, Loader2, Check, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function BranchSelectorModal() {
    const { availableBranches, switchBranch } = useAuth();
    const [selecting, setSelecting] = useState<string | null>(null);

    const handleSelect = async (id: string | null) => {
        setSelecting(id || "__all__");
        await switchBranch(id);
    };

    if (availableBranches.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-lg bg-white/75 border border-border/50 rounded-[2.5rem] shadow-2xl shadow-primary/5 backdrop-blur-xl p-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Select Campus</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Choose a campus to manage or view an overview of all campuses.
                    </p>
                </div>

                <div className="space-y-3">
                    {/* All Campuses */}
                    <button
                        onClick={() => handleSelect(null)}
                        disabled={selecting === "__all__"}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left group card-hover disabled:opacity-70"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {selecting === "__all__" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Globe className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-primary">All Campuses</p>
                            <p className="text-xs text-muted-foreground">View system-wide overview and reports</p>
                        </div>
                        {selecting === "__all__" ? null : (
                            <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all">
                                <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </button>

                    <div className="relative">
                        <hr className="border-border/50" />
                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/75 px-3 text-xs text-muted-foreground">or</span>
                    </div>

                    {availableBranches.map((branch, idx) => (
                        <motion.button
                            key={branch.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            onClick={() => handleSelect(branch.id)}
                            disabled={selecting === branch.id}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white/50 hover:bg-white hover:border-primary/30 transition-all text-left group card-hover disabled:opacity-70"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                                {selecting === branch.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Building2 className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">{branch.name}</p>
                                <p className="text-xs text-muted-foreground font-mono uppercase">{branch.code}</p>
                            </div>
                            {selecting === branch.id ? null : (
                                <div className="w-8 h-8 rounded-full border-2 border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                    <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

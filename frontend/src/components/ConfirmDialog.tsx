"use client";

import { AlertCircle, CheckCircle2, Loader2, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    warningText?: string;
    warningDetail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    successMessage?: string;
    detailInfo?: { label?: string; title: string; subtitle: string };
}

export default function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    warningText,
    warningDetail,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    successMessage,
    detailInfo,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/75 w-full max-w-md rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {successMessage ? (
                    <div className="p-10 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Success</h3>
                        <p className="text-muted-foreground text-sm">{successMessage}</p>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{title}</h3>
                                    <p className="text-muted-foreground text-sm">This action cannot be undone</p>
                                </div>
                                <button onClick={onCancel} disabled={loading} className="p-1 hover:bg-muted rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            <p className="text-sm">{message}</p>
                            {warningText && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{warningText}</p>
                                    {warningDetail && <p className="text-sm text-muted-foreground">{warningDetail}</p>}
                                </div>
                            )}
                            {detailInfo && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                    <div className="w-5 h-5 flex items-center justify-center text-muted-foreground shrink-0">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold">{detailInfo.title}</p>
                                        {detailInfo.subtitle && <p className="text-muted-foreground text-xs">{detailInfo.subtitle}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-8 border-t border-border bg-muted/20 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-bold hover:bg-muted bg-white/75 border border-border rounded-xl transition-all disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className="px-8 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><Trash2 size={18} /> {confirmLabel}</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

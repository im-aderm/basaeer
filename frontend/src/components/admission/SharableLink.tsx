"use client";

import { useState } from "react";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";
import { useNotification } from '@/context/NotificationContext';

interface SharableLinkProps {
    branchId: string;
    label?: string;
}

export default function SharableLink({ branchId, label = "Online Admission Link" }: SharableLinkProps) {
    const { showSuccess, showError } = useNotification();
    const [copied, setCopied] = useState(false);

    const getPublicUrl = () => {
        if (typeof window === 'undefined') return "";
        return `${window.location.origin}/admission/apply/${branchId}`;
    };

    const handleCopy = async () => {
        const url = getPublicUrl();
        if (!url) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                showSuccess("Link copied to clipboard!");
            } else {
                throw new Error("Clipboard API not available");
            }
        } catch (err) {
            // Fallback for non-secure contexts or older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                showSuccess("Link copied to clipboard!");
            } catch (fallbackErr) {
                if (process.env.NODE_ENV === 'development') console.error("Copy failed:", fallbackErr);
                showError("Could not copy link. Please copy it manually.");
            }
        }

        if (copied) {
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const publicUrl = getPublicUrl();

    return (
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-primary mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Share2 size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-lg leading-none">{label}</h3>
                    <p className="text-xs font-medium opacity-70">Share this link with parents to accept online applications.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-white border border-primary/5 rounded-2xl px-4 py-3 font-mono text-sm text-muted-foreground truncate flex items-center">
                    {publicUrl || "Loading link..."}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${copied
                            ? "bg-green-500 text-white"
                            : "bg-primary text-white hover:opacity-90 active:scale-95"
                            }`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied" : "Copy Link"}
                    </button>

                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-white border border-primary/10 text-primary hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center"
                        title="Open Portal"
                    >
                        <ExternalLink size={20} />
                    </a>
                </div>
            </div>
        </div>
    );
}

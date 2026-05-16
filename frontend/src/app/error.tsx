'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-10 max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-h1 font-bold tracking-tight text-primary mb-3">Something went wrong</h1>
                <p className="text-muted-foreground mb-8">{error.message || 'An unexpected error occurred'}</p>
                <button
                    onClick={reset}
                    className="btn-press inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        </div>
    );
}

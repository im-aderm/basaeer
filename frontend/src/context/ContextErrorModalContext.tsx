"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ContextError {
    code: string;
    message: string;
    failedRequest?: {
        url: string;
        method: string;
        data?: any;
    };
}

interface ContextErrorModalState {
    error: ContextError | null;
    isOpen: boolean;
    showError: (error: ContextError) => void;
    dismissError: () => void;
}

const ContextErrorModalContext = createContext<ContextErrorModalState>({
    error: null,
    isOpen: false,
    showError: () => {},
    dismissError: () => {},
});

export function ContextErrorModalProvider({ children }: { children: ReactNode }) {
    const [error, setError] = useState<ContextError | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const showError = useCallback((contextError: ContextError) => {
        setError(contextError);
        setIsOpen(true);
    }, []);

    const dismissError = useCallback(() => {
        setError(null);
        setIsOpen(false);
    }, []);

    return (
        <ContextErrorModalContext.Provider value={{ error, isOpen, showError, dismissError }}>
            {children}
        </ContextErrorModalContext.Provider>
    );
}

export const useContextErrorModal = () => useContext(ContextErrorModalContext);

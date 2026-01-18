"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

const Tabs = ({
    defaultValue,
    value: controlledValue,
    onValueChange,
    children,
    className
}: {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) => {
    const [value, setValue] = React.useState(defaultValue || "");
    const activeValue = controlledValue !== undefined ? controlledValue : value;
    const handleChange = onValueChange || setValue;

    return (
        <TabsContext.Provider value={{ value: activeValue, onValueChange: handleChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
};

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
        {children}
    </div>
);

const TabsTrigger = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
    const context = React.useContext(TabsContext);
    if (!context) return null;

    const isActive = context.value === value;

    return (
        <button
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
    const context = React.useContext(TabsContext);
    if (!context) return null;

    if (context.value !== value) return null;

    return (
        <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent }

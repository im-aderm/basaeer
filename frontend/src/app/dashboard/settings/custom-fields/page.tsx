"use client";

import { Settings2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomFieldsPage() {
    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-h1 font-semibold tracking-tight">Custom Fields</h1>
                <p className="text-muted-foreground font-medium mt-1">Add additional data points to students, staff, and other entities.</p>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <Settings2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Custom Fields</h2>
                    <p className="text-sm text-muted-foreground max-w-md text-center mb-4">
                        This feature is being developed. You&apos;ll be able to create and manage custom data fields for students, staff, and expenses.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Coming soon</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
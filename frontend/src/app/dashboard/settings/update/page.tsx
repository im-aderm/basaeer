"use client";

import { Package, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SystemUpdatePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-h1 font-semibold tracking-tight">System Update</h1>
                <p className="text-muted-foreground font-medium mt-1">Manage platform versions and software updates.</p>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <Package className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">System Updates</h2>
                    <p className="text-sm text-muted-foreground max-w-md text-center mb-4">
                        Automated system updates and version management will be available here. Updates are currently managed through the deployment pipeline.
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
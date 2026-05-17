"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ExecutiveInsight } from "@/types/analytics";

interface ExecutiveInsightsProps {
    insights: ExecutiveInsight[];
}

const iconMap = {
    positive: Lightbulb,
    warning: AlertTriangle,
    critical: AlertCircle,
    info: Info,
};

const colorMap = {
    positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600", icon: "text-emerald-500" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600", icon: "text-amber-500" },
    critical: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-600", icon: "text-red-500" },
    info: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-600", icon: "text-blue-500" },
};

const trendIconMap = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};

export default function ExecutiveInsights({ insights }: ExecutiveInsightsProps) {
    if (insights.length === 0) return null;

    return (
        <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
            <CardHeader>
                <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Executive Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.map((insight, i) => {
                        const colors = colorMap[insight.type];
                        const Icon = iconMap[insight.type];
                        const TrendIcon = trendIconMap[insight.trend];
                        return (
                            <div key={i} className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} space-y-2`}>
                                <div className="flex items-center justify-between">
                                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                                    <TrendIcon className={`w-4 h-4 ${insight.trend === "up" ? "text-emerald-500" : insight.trend === "down" ? "text-red-500" : "text-muted-foreground"}`} />
                                </div>
                                <p className="font-bold text-sm text-foreground">{insight.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

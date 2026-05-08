import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon: LucideIcon;
    color?: "blue" | "green" | "purple" | "orange" | "red";
    loading?: boolean;
}

const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
};

export function AnalyticsCard({ title, value, trend, icon: Icon, color = "blue", loading }: AnalyticsCardProps) {
    if (loading) {
        return (
            <Card className="rounded-[2.5rem] border-border/50 shadow-xl animate-pulse">
                <CardHeader className="pb-2 h-20 bg-muted/20" />
                <CardContent className="h-24" />
            </Card>
        );
    }

    return (
        <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-card overflow-hidden group hover:shadow-2xl transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-70">
                        {title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-xl border", colorMap[color])}>
                        <Icon size={16} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tight">{value}</span>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-1 text-xs font-bold",
                            trend.isPositive ? "text-green-500" : "text-red-500"
                        )}>
                            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend.value}% vs last month
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

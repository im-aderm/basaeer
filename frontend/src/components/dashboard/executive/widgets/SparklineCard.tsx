"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparklineCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: number;
    subtitle?: string;
    sparklineData?: Array<{ value: number }>;
    onClick?: () => void;
}

const colorMap: Record<string, { bg: string; text: string; icon: string; area: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-600", icon: "text-blue-500", area: "#3b82f6" },
    green: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary", area: "#281e37" },
    orange: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary", area: "#281e37" },
    purple: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary", area: "#281e37" },
    red: { bg: "bg-red-500/10", text: "text-red-600", icon: "text-red-500", area: "#ef4444" },
    primary: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary", area: "#281e37" },
};

export default function SparklineCard({ title, value, icon: Icon, color, trend, subtitle, sparklineData, onClick }: SparklineCardProps) {
    const colors = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`bg-white rounded-[2rem] border border-border/50 shadow-xl p-6 hover:shadow-2xl transition-shadow group ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend > 0 ? "bg-primary/10 text-primary" : trend < 0 ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground opacity-60">{title}</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>}
            </div>
            {sparklineData && sparklineData.length > 1 && (
                <div className="h-12 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <Area type="monotone" dataKey="value" stroke={colors.area} fill={colors.area} fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}

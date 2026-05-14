"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "blue" | "green" | "purple" | "orange" | "red" | "primary";

interface StatCardProps {
  title: string;
  value: string | number | undefined | null;
  subtitle?: string;
  icon?: LucideIcon;
  color?: StatColor;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
  error?: string | null;
  formatter?: (value: string | number) => string;
  goal?: { target: number; label: string };
}

const colorMap: Record<StatColor, { icon: string; bg: string }> = {
  blue: { icon: "text-blue-500", bg: "bg-blue-500/10" },
  green: { icon: "text-green-500", bg: "bg-green-500/10" },
  purple: { icon: "text-purple-500", bg: "bg-purple-500/10" },
  orange: { icon: "text-orange-500", bg: "bg-orange-500/10" },
  red: { icon: "text-red-500", bg: "bg-red-500/10" },
  primary: { icon: "text-primary", bg: "bg-primary/10" },
};

function Skeleton() {
  return (
    <div className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-8 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-4" />
      <div className="h-8 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-8">
      <h3 className="text-label mb-4 text-muted-foreground">{title}</h3>
      <p className="text-h1 font-semibold tracking-tight text-muted-foreground/40">—</p>
      <p className="text-xs text-muted-foreground/40 mt-1">No data available</p>
    </div>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-[2.5rem] p-8">
      <h3 className="text-label mb-2 text-destructive">{title}</h3>
      <p className="text-xs text-destructive/70">{message}</p>
    </div>
  );
}

export function StatCardWidget({
  title, value, subtitle, icon: Icon, color = "primary", trend, loading, error, formatter, goal
}: StatCardProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title={title} message={error} />;
  if (value === undefined || value === null) return <EmptyState title={title} />;

  const numericValue = typeof value === "number" ? value : typeof value === "string" ? parseFloat(value) : NaN;
  const displayValue = formatter ? formatter(value) : value;
  const colors = colorMap[color];
  const showGoal = goal && !isNaN(numericValue);

  return (
    <div className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-8 hover:bg-muted/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-label group-hover:text-primary transition-colors">{title}</h3>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
            <Icon size={18} className={colors.icon} />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-h1 font-semibold tracking-tight">{displayValue}</p>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-1.5 text-xs font-semibold",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend.value}% vs last month</span>
          </div>
        )}

        {showGoal && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{goal!.label}</span>
              <span className={cn(
                "font-semibold",
                numericValue / goal!.target >= 0.9 && "text-green-600",
                numericValue / goal!.target >= 0.75 && numericValue / goal!.target < 0.9 && "text-amber-600",
                numericValue / goal!.target < 0.75 && "text-red-600"
              )}>
                {Math.min(100, Math.round((numericValue / goal!.target) * 100))}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  numericValue / goal!.target >= 0.9 && "bg-green-500",
                  numericValue / goal!.target >= 0.75 && numericValue / goal!.target < 0.9 && "bg-amber-500",
                  numericValue / goal!.target < 0.75 && "bg-red-500"
                )}
                style={{ width: `${Math.min(100, (numericValue / goal!.target) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

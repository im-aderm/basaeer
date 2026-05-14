"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Card } from "@/components/ui/card";
import { AlertCircle, BarChart3 } from "lucide-react";

type ChartType = "line" | "bar" | "pie" | "area";

interface ChartWidgetProps {
  title: string;
  description?: string;
  data?: any[] | null;
  type: ChartType;
  dataKey?: string;
  nameKey?: string;
  color?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
}

const CHART_COLORS = ["#00a0e1", "#281e37", "#38bdf8", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

function Skeleton({ height }: { height: number }) {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl animate-pulse">
      <div className="p-6 pb-2">
        <div className="h-5 w-48 bg-muted rounded mb-1" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="p-6 pt-2" style={{ height }}>
        <div className="w-full h-full bg-muted/50 rounded-xl" />
      </div>
    </Card>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl">
      <div className="p-6 pb-2">
        <h3 className="text-h3 font-semibold">{title}</h3>
      </div>
      <div className="p-6 flex flex-col items-center justify-center" style={{ height: 250 }}>
        <BarChart3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">No chart data available yet</p>
      </div>
    </Card>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="rounded-[2.5rem] border-destructive/20 shadow-xl">
      <div className="p-6 pb-2">
        <h3 className="text-h3 font-semibold text-destructive">{title}</h3>
      </div>
      <div className="p-6 flex flex-col items-center justify-center" style={{ height: 250 }}>
        <AlertCircle className="w-10 h-10 text-destructive/50 mb-3" />
        <p className="text-sm text-destructive/70">{message}</p>
      </div>
    </Card>
  );
}

export function ChartWidget({
  title, description, data, type, dataKey = "value", nameKey = "name",
  color = "#00a0e1", height = 300, loading, error
}: ChartWidgetProps) {
  if (loading) return <Skeleton height={height} />;
  if (error) return <ErrorState title={title} message={error} />;
  if (!data || data.length === 0) return <EmptyState title={title} />;

  const chartData = data;

  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-card overflow-hidden">
      <div className="p-6 pb-2">
        <h3 className="text-h3 font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-6 pt-2">
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            {type === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : type === "area" ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            ) : type === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey={dataKey} nameKey={nameKey}>
                  {chartData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

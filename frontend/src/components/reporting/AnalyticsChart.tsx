"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";

interface AnalyticsChartProps {
    title: string;
    description?: string;
    data: any[];
    type: "line" | "bar" | "pie";
    dataKey: string;
    nameKey?: string;
    color?: string;
    height?: number;
    loading?: boolean;
}

export function AnalyticsChart({ 
    title, 
    description, 
    data, 
    type, 
    dataKey, 
    nameKey = "name",
    color = "#3b82f6",
    height = 300,
    loading 
}: AnalyticsChartProps) {
    if (loading) {
        return (
            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden animate-pulse">
                <CardHeader className="p-8 h-20 bg-muted/20" />
                <CardContent className="p-8 h-64 bg-muted/10" />
            </Card>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-h3 font-semibold">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="p-8">
                <div style={{ width: '100%', height: height }}>
                    <ResponsiveContainer>
                        {type === "line" ? (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey={nameKey} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey={dataKey} 
                                    stroke={color} 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        ) : type === "bar" ? (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey={nameKey} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey={dataKey}
                                    nameKey={nameKey}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

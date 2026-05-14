"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface DashboardFiltersProps {
  onApply: (filters: { startDate?: string; endDate?: string; classId?: string }) => void;
}

export function DashboardFilters({ onApply }: DashboardFiltersProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get("/classes").then((res) => setClasses(res.data)).catch(() => {});
  }, []);

  const handleApply = () => {
    onApply({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      classId: classId || undefined,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setClassId("");
    onApply({});
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-10 rounded-xl border border-border px-4 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-10 rounded-xl border border-border px-4 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">Class</label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="h-10 rounded-xl border border-border px-4 text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleApply}
        className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
      <button
        onClick={handleReset}
        className="h-10 px-6 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

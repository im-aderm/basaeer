"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, AlertCircle, Table2 } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableWidgetProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data?: T[] | null;
  loading?: boolean;
  error?: string | null;
  pageSize?: number;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function Skeleton({ columns }: { columns: number }) {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl animate-pulse">
      <div className="p-6 pb-2">
        <div className="h-5 w-48 bg-muted rounded mb-1" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="h-4 bg-muted rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl">
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
        <Table2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">{message}</p>
      </div>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="rounded-[2.5rem] border-destructive/20 shadow-xl">
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
        <AlertCircle className="w-10 h-10 text-destructive/50 mb-3" />
        <p className="text-sm text-destructive/70">{message}</p>
      </div>
    </Card>
  );
}

export function TableWidget<T>({
  title, description, columns, data, loading, error,
  pageSize = 10, keyExtractor, emptyMessage = "No data available"
}: TableWidgetProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data, pageSize]);

  const pageData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  if (loading) return <Skeleton columns={columns.length} />;
  if (error) return <ErrorState message={error} />;
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />;

  if (page > totalPages && totalPages > 0) setPage(totalPages);

  return (
    <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-card overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-h3 font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border/50">
              {columns.map((col) => (
                <th key={col.key} className={`text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3 ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, i) => (
              <tr key={keyExtractor(item)} className={i < pageData.length - 1 ? "border-b border-border/30" : ""}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-3 text-sm ${col.className ?? ""}`}>
                    {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({data.length} items)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

'use client';

import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

interface AcademicTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  onRefresh: () => void;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}

export function AcademicTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  onRefresh,
  emptyMessage = 'No records found',
  keyExtractor,
}: AcademicTableProps<T>) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Records
          {data.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({data.length})
            </span>
          )}
        </CardTitle>
        <Button onClick={onRefresh} variant="outline" size="sm" className="h-9">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${col.className || ''}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row) => (
                  <tr key={keyExtractor(row)} className="hover:bg-muted/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    ACTIVE: 'default',
    PENDING: 'secondary',
    COMPLETED: 'default',
    APPROVED: 'default',
    PUBLISHED: 'default',
    DRAFT: 'outline',
    FAILED: 'destructive',
    REJECTED: 'destructive',
    UNPUBLISHED: 'secondary',
    QUEUED: 'secondary',
    PROCESSING: 'secondary',
    SUCCESS: 'default',
    EXPIRED: 'outline',
    CANCELLED: 'destructive',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
}

"use client";

import { useState, useMemo } from "react";

interface Column<T> {
    header: string | (() => React.ReactNode);
    accessor?: keyof T | ((item: T) => React.ReactNode);
    accessorKey?: string;
    cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (item: T) => React.ReactNode;
    searchKey?: string;
    pageSize?: number;
}

const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable<T extends { id: string }>({ columns, data, actions, pageSize = 50 }: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / pageSize);
    
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    return (
        <div className="flex flex-col space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className="px-4 py-3 text-label">
                                    {typeof col.header === 'function' ? col.header() : col.header}
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 text-label text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-secondary">
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                                    {columns.map((col, index) => (
                                        <td key={index} className="px-4 py-3 text-table-cell text-foreground">
                                            {col.cell ? col.cell(item) :
                                                typeof col.accessor === "function" ? col.accessor(item) :
                                                    col.accessor ? (item[col.accessor] as React.ReactNode) :
                                                        col.accessorKey ? (getNestedValue(item, col.accessorKey) as React.ReactNode) :
                                                            null}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-right">
                                            {actions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted/50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted/50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

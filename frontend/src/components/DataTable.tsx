"use client";

import { useState, useMemo } from "react";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_ACTIONS, PAGINATION_BAR, PAGINATION_INFO, PAGINATION_BUTTON, PAGINATION_BUTTON_ACTIVE, SORT_ICON } from "@/lib/table-styles";

interface Column<T> {
    header: string | (() => React.ReactNode);
    accessor?: keyof T | ((item: T) => React.ReactNode);
    accessorKey?: string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
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
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const totalPages = Math.ceil(data.length / pageSize);

    const sortedData = useMemo(() => {
        if (!sortField) return data;
        return [...data].sort((a, b) => {
            const aVal = getNestedValue(a, sortField);
            const bVal = getNestedValue(b, sortField);
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDirection === "asc" ? cmp : -cmp;
        });
    }, [data, sortField, sortDirection]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const renderPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages.map((p, i) =>
            typeof p === "string"
                ? <span key={`e${i}`} className="px-2 text-[12px] text-foreground/40">{p}</span>
                : <button key={p} onClick={() => setCurrentPage(p)} className={p === currentPage ? PAGINATION_BUTTON_ACTIVE : PAGINATION_BUTTON}>{p}</button>
        );
    };

    const renderSortIndicator = (field: string) => {
        if (sortField !== field) return <span className={SORT_ICON}>↕</span>;
        return <span className={SORT_ICON}>{sortDirection === "asc" ? "↑" : "↓"}</span>;
    };

    const resolveField = (col: Column<T>): string | null => {
        if (typeof col.accessor === "string") return col.accessor;
        if (col.accessorKey) return col.accessorKey;
        return null;
    };

    return (
        <div className="flex flex-col space-y-3">
            <div className="overflow-x-auto rounded-lg border border-primary/20 bg-card shadow-sm">
                <table className={TABLE_ROOT}>
                    <thead>
                        <tr className={TABLE_HEADER}>
                            {columns.map((col, index) => {
                                const field = resolveField(col);
                                const isSortable = col.sortable && field;
                                return (
                                    <th
                                        key={index}
                                        className={isSortable ? TABLE_HEADER_CELL : TABLE_HEADER_CELL_NO_SORT}
                                        onClick={isSortable ? () => handleSort(field!) : undefined}
                                    >
                                        {typeof col.header === 'function' ? col.header() : col.header}
                                        {isSortable && renderSortIndicator(field!)}
                                    </th>
                                );
                            })}
                            {actions && <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody className={TABLE_BODY}>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-foreground/50 text-[12px]">
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr key={item.id} className={TABLE_ROW}>
                                    {columns.map((col, index) => (
                                        <td key={index} className={TABLE_CELL}>
                                            {col.cell ? col.cell(item) :
                                                typeof col.accessor === "function" ? col.accessor(item) :
                                                    col.accessor ? (item[col.accessor] as React.ReactNode) :
                                                        col.accessorKey ? (getNestedValue(item, col.accessorKey) as React.ReactNode) :
                                                            null}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className={TABLE_CELL_ACTIONS}>
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
                <div className={PAGINATION_BAR}>
                    <p className={PAGINATION_INFO}>
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
                    </p>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={PAGINATION_BUTTON}
                        >
                            Previous
                        </button>
                        {renderPageNumbers()}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={PAGINATION_BUTTON}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

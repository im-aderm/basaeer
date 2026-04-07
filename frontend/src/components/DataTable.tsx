"use client";

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
}

const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable<T extends { id: string }>({ columns, data, actions }: DataTableProps<T>) {
    return (
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
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-secondary">
                                No data available.
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
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
    );
}

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { Save, AlertTriangle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const FixedSizeList = dynamic(() => import('react-window').then(mod => (mod as any).FixedSizeList), { ssr: false }) as any;

interface StudentMark {
    studentId: string;
    name: string;
    asgn1: number;
    asgn2: number;
    test1: number;
    test2: number;
    examScore: number;
    total: number;
}

interface MarkEntrySpreadsheetProps {
    data: StudentMark[];
    onSave: (updates: StudentMark[]) => Promise<void>;
    onBack: () => void;
}

const columnHelper = createColumnHelper<StudentMark>();

export function MarkEntrySpreadsheet({ data: initialData, onSave, onBack }: MarkEntrySpreadsheetProps) {
    const [data, setData] = useState(initialData);
    const [saving, setSaving] = useState(false);
    const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Student Name',
            cell: info => <div className="font-medium text-gray-900 px-2 py-1">{info.getValue()}</div>,
            size: 250,
        }),
        columnHelper.accessor('asgn1', {
            header: 'Asgn 1',
            cell: ({ getValue, row, column }) => <EditableCell getValue={getValue} row={row} column={column} updateData={updateData} />,
            size: 80,
        }),
        columnHelper.accessor('asgn2', {
            header: 'Asgn 2',
            cell: ({ getValue, row, column }) => <EditableCell getValue={getValue} row={row} column={column} updateData={updateData} />,
            size: 80,
        }),
        columnHelper.accessor('test1', {
            header: 'Test 1',
            cell: ({ getValue, row, column }) => <EditableCell getValue={getValue} row={row} column={column} updateData={updateData} />,
            size: 80,
        }),
        columnHelper.accessor('test2', {
            header: 'Test 2',
            cell: ({ getValue, row, column }) => <EditableCell getValue={getValue} row={row} column={column} updateData={updateData} />,
            size: 80,
        }),
        columnHelper.accessor('examScore', {
            header: 'Exam',
            cell: ({ getValue, row, column }) => <EditableCell getValue={getValue} row={row} column={column} updateData={updateData} />,
            size: 100,
        }),
        columnHelper.accessor('total', {
            header: 'Total',
            cell: info => {
                const row = info.row.original;
                const total = (row.asgn1 || 0) + (row.asgn2 || 0) + (row.test1 || 0) + (row.test2 || 0) + (row.examScore || 0);
                return <div className="font-bold text-blue-600 px-2 py-1">{total}</div>;
            },
            size: 100,
        }),
    ], [data]);

    const updateData = (rowIndex: number, columnId: string, value: any) => {
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    setDirtyRows(prev => new Set(prev).add(row.studentId));
                    return {
                        ...old[rowIndex]!,
                        [columnId]: value,
                    };
                }
                return row;
            })
        );
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const { rows } = table.getRowModel();

    const handleSave = async () => {
        const updates = data.filter(row => dirtyRows.has(row.studentId));
        if (updates.length === 0) {
            toast.info('No changes to save');
            return;
        }

        try {
            setSaving(true);
            await onSave(updates);
            setDirtyRows(new Set());
            toast.success(`Successfully saved marks for ${updates.length} students`);
        } catch (error) {
            toast.error('Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    const RenderRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const row = rows[index];
        return (
            <div 
                style={style} 
className={`flex border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    dirtyRows.has(row.original.studentId) ? 'bg-yellow-50/30' : ''
                }`}
            >
                {row.getVisibleCells().map(cell => (
                    <div 
                        key={cell.id} 
                        style={{ width: cell.column.getSize() }}
                        className="flex items-center"
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <header className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Batch Mark Entry</h2>
                        <p className="text-xs text-gray-500">Editing marks for {data.length} students</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {dirtyRows.size > 0 && (
                        <span className="text-xs font-medium text-amber-600 bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            {dirtyRows.size} unsaved changes
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all active:scale-95"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save All
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <div className="flex bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups()[0].headers.map(header => (
                        <div 
                            key={header.id} 
                            style={{ width: header.getSize() }}
                            className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-widest"
                        >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                    ))}
                </div>

                <FixedSizeList
                    height={600}
                    itemCount={rows.length}
                    itemSize={50}
                    width="100%"
                    className="custom-scrollbar"
                >
                    {RenderRow}
                </FixedSizeList>
            </div>
        </div>
    );
}

function EditableCell({ getValue, row: { index }, column: { id }, updateData }: any) {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);

    const onBlur = () => {
        updateData(index, id, Number(value) || 0);
    };

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            type="number"
            className="w-full h-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/20 px-2 py-1 text-center font-medium"
        />
    );
}

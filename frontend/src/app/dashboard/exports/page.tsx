'use client';

import { useState, useEffect } from 'react';
import { academicExportService, AcademicExport, ExportStatus } from '@/services/academicExportService';
import {
    Download,
    FileText,
    FileSpreadsheet,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Trash2,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function ExportDashboardPage() {
    const [exports, setExports] = useState<AcademicExport[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadExports();
        // Setup a polling interval as a fallback until WebSockets are fully integrated
        const interval = setInterval(loadExports, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadExports = async () => {
        try {
            const data = await academicExportService.getExports();
            setExports(data);
        } catch (error) {
            console.error('Failed to load exports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this export from history?')) return;
        try {
            await academicExportService.deleteExport(id);
            setExports(exports.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete export:', error);
        }
    };

    const getStatusIcon = (status: ExportStatus) => {
        switch (status) {
            case ExportStatus.QUEUED:
                return <Clock className="w-5 h-5 text-gray-400" />;
            case ExportStatus.PROCESSING:
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case ExportStatus.COMPLETED:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case ExportStatus.FAILED:
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold text-gray-900">Export Management</h1>
                    <p className="text-gray-600 mt-1">
                        Track and manage your academic record exports
                    </p>
                </div>
                <button
                    onClick={() => { setRefreshing(true); loadExports(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            ) : exports.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No exports found</h3>
                    <p className="text-gray-500">Trigger an export from the academic pages to see it here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {exports.map((exp) => (
                                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {exp.type.includes('EXCEL') || exp.type.includes('CSV') ? (
                                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-red-500" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{exp.type.replace(/_/g, ' ')}</p>
                                                {exp.fileName && (
                                                    <p className="text-xs text-gray-500">{exp.fileName} ({formatFileSize(exp.fileSize)})</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(exp.status)}
                                            <span className="text-sm font-medium text-gray-700">
                                                {exp.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-48">
                                        <div className="space-y-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        exp.status === ExportStatus.FAILED ? 'bg-red-500' : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${exp.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{exp.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(exp.createdAt), 'MMM d, yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {exp.status === ExportStatus.COMPLETED && exp.fileUrl && (
                                                <a
                                                    href={exp.fileUrl}
                                                    download={exp.fileName}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download File"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(exp.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete from history"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

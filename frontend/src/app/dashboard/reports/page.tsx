'use client';

import { useState, useEffect } from 'react';
import { reportingService, DashboardData } from '@/services/reportingService';
import {
    FileText,
    Download,
    TrendingUp,
    Users,
    DollarSign,
    Package,
    BookOpen,
    AlertTriangle,
    FileSpreadsheet
} from 'lucide-react';

export default function ReportsPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await reportingService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: string, format: 'pdf' | 'excel') => {
        try {
            setExporting(`${type}-${format}`);
            switch (type) {
                case 'student':
                    format === 'pdf'
                        ? await reportingService.exportStudentPerformancePDF()
                        : await reportingService.exportStudentPerformanceExcel();
                    break;
                case 'fees':
                    format === 'pdf'
                        ? await reportingService.exportFeesPDF()
                        : await reportingService.exportFeesExcel();
                    break;
                case 'hr':
                    format === 'pdf'
                        ? await reportingService.exportHRPDF()
                        : await reportingService.exportHRExcel();
                    break;
                case 'inventory':
                    format === 'pdf'
                        ? await reportingService.exportInventoryPDF()
                        : await reportingService.exportInventoryExcel();
                    break;
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
 <p className="text-gray-500 ">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
 <h1 className="text-h1 font-bold text-gray-900 ">
                        Enterprise Reports
                    </h1>
 <p className="text-gray-600 mt-1">
                        Comprehensive insights across all departments
                    </p>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    title="Total Invoiced"
                    value={`$${dashboardData.finance.totalInvoiced.toLocaleString()}`}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Total Paid"
                    value={`$${dashboardData.finance.totalPaid.toLocaleString()}`}
                    color="green"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6" />}
                    title="Total Expenses"
                    value={`$${dashboardData.finance.totalExpenses.toLocaleString()}`}
                    color="orange"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Net Profit"
                    value={`$${dashboardData.finance.netProfit.toLocaleString()}`}
                    color={dashboardData.finance.netProfit >= 0 ? 'green' : 'red'}
                />
            </div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Performance */}
                <ReportCard
                    title="Student Performance"
                    icon={<BookOpen className="w-6 h-6" />}
                    color="purple"
                    onExportPDF={() => handleExport('student', 'pdf')}
                    onExportExcel={() => handleExport('student', 'excel')}
                    isExporting={exporting?.startsWith('student') || false}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
 <span className="text-gray-600 ">Total Students</span>
 <span className="text-2xl font-bold text-gray-900 ">
                                {dashboardData.academic.totalStudents}
                            </span>
                        </div>
                        <div className="space-y-2">
 <h4 className="font-semibold text-gray-900 ">Recent Exams</h4>
                            {dashboardData.academic.recentExamStats.slice(0, 3).map((exam, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
 <span className="text-gray-600 truncate flex-1">
                                        {exam.title}
                                    </span>
 <span className="font-medium text-gray-900 ml-2">
                                        {exam.avgScore.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ReportCard>

                {/* Financial Report */}
                <ReportCard
                    title="Financial Summary"
                    icon={<DollarSign className="w-6 h-6" />}
                    color="green"
                    onExportPDF={() => handleExport('fees', 'pdf')}
                    onExportExcel={() => handleExport('fees', 'excel')}
                    isExporting={exporting?.startsWith('fees') || false}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
 <p className="text-sm text-gray-600 ">Invoiced</p>
 <p className="text-xl font-bold text-gray-900 ">
                                    ${dashboardData.finance.totalInvoiced.toLocaleString()}
                                </p>
                            </div>
                            <div>
 <p className="text-sm text-gray-600 ">Collected</p>
 <p className="text-xl font-bold text-green-600 ">
                                    ${dashboardData.finance.totalPaid.toLocaleString()}
                                </p>
                            </div>
                        </div>
 <div className="pt-4 border-t border-gray-200 ">
 <p className="text-sm text-gray-600 ">Net Profit</p>
                            <p className={`text-2xl font-bold ${dashboardData.finance.netProfit >= 0
 ? 'text-green-600 '
 : 'text-red-600 '
                                }`}>
                                ${dashboardData.finance.netProfit.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </ReportCard>

                {/* HR Statistics */}
                <ReportCard
                    title="HR Statistics"
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                    onExportPDF={() => handleExport('hr', 'pdf')}
                    onExportExcel={() => handleExport('hr', 'excel')}
                    isExporting={exporting?.startsWith('hr') || false}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
 <span className="text-gray-600 ">Total Staff</span>
 <span className="text-2xl font-bold text-gray-900 ">
                                {dashboardData.hr.totalStaff}
                            </span>
                        </div>
                        <div className="space-y-2">
 <h4 className="font-semibold text-gray-900 ">By Role</h4>
                            {dashboardData.hr.roleDistribution.map((role, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
 <span className="text-gray-600 ">{role.role}</span>
 <span className="font-medium text-gray-900 ">
                                        {role.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ReportCard>

                {/* Inventory Statistics */}
                <ReportCard
                    title="Inventory Statistics"
                    icon={<Package className="w-6 h-6" />}
                    color="orange"
                    onExportPDF={() => handleExport('inventory', 'pdf')}
                    onExportExcel={() => handleExport('inventory', 'excel')}
                    isExporting={exporting?.startsWith('inventory') || false}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
 <p className="text-sm text-gray-600 ">Products</p>
 <p className="text-xl font-bold text-gray-900 ">
                                    {dashboardData.inventory.totalProducts}
                                </p>
                            </div>
                            <div>
 <p className="text-sm text-gray-600 ">Total Units</p>
 <p className="text-xl font-bold text-gray-900 ">
                                    {dashboardData.inventory.totalUnits}
                                </p>
                            </div>
                        </div>
                        {dashboardData.inventory.lowStockItems > 0 && (
 <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
 <AlertTriangle className="w-5 h-5 text-red-600 " />
                                <div>
 <p className="text-sm font-medium text-red-900 ">
                                        Low Stock Alert
                                    </p>
 <p className="text-xs text-red-700 ">
                                        {dashboardData.inventory.lowStockItems} items need restocking
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ReportCard>
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

function StatCard({ icon, title, value, color }: StatCardProps) {
    const colorClasses = {
 blue: 'bg-blue-500/10 text-blue-600 ',
 green: 'bg-green-500/10 text-green-600 ',
 orange: 'bg-orange-500/10 text-orange-600 ',
 purple: 'bg-purple-500/10 text-purple-600 ',
 red: 'bg-red-500/10 text-red-600 ',
    };

    return (
 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 ">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
 <p className="text-sm text-gray-600 ">{title}</p>
 <p className="text-2xl font-bold text-gray-900 ">{value}</p>
                </div>
            </div>
        </div>
    );
}

interface ReportCardProps {
    title: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    children: React.ReactNode;
    onExportPDF: () => void;
    onExportExcel: () => void;
    isExporting: boolean;
}

function ReportCard({ title, icon, color, children, onExportPDF, onExportExcel, isExporting }: ReportCardProps) {
    const colorClasses = {
 blue: 'bg-blue-500/10 text-blue-600 ',
 green: 'bg-green-500/10 text-green-600 ',
 orange: 'bg-orange-500/10 text-orange-600 ',
 purple: 'bg-purple-500/10 text-purple-600 ',
    };

    return (
 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 ">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
 <h3 className="text-lg font-semibold text-gray-900 ">{title}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onExportPDF}
                        disabled={isExporting}
 className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Export as PDF"
                    >
 <FileText className="w-5 h-5 text-gray-600 " />
                    </button>
                    <button
                        onClick={onExportExcel}
                        disabled={isExporting}
 className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Export as Excel"
                    >
 <FileSpreadsheet className="w-5 h-5 text-gray-600 " />
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
}

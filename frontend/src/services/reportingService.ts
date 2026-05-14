import api from '@/lib/api';
import { devLog } from '@/lib/dev-log';
import type { DashboardData } from '@/types/dashboard';

// Legacy type for the reports page (uses old data shape)
export interface LegacyDashboardData {
    finance: {
        totalInvoiced: number;
        totalPaid: number;
        totalExpenses: number;
        netProfit: number;
    };
    academic: {
        totalStudents: number;
        recentExamStats: Array<{
            title: string;
            avgScore: number;
            totalParticipants: number;
        }>;
    };
    inventory: {
        totalProducts: number;
        lowStockItems: number;
        totalUnits: number;
    };
    hr: {
        totalStaff: number;
        roleDistribution: Array<{
            role: string;
            count: number;
        }>;
    };
}

function downloadBlob(response: any, filename: string) {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export const reportingService = {
    getDashboard: async (): Promise<DashboardData> => {
        const response = await api.get('/reporting/dashboard');
        return response.data;
    },

    getFinancialReport: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        const response = await api.get(`/reporting/finance?${params.toString()}`);
        return response.data;
    },

    getStudentAnalytics: async (params?: { branchId?: string; classId?: string; sectionId?: string }): Promise<import('@/types/dashboard').StudentAnalyticsData> => {
        const response = await api.get('/reporting/students', { params });
        return response.data;
    },

    getFinanceAnalytics: async (params?: { branchId?: string; startDate?: string; endDate?: string; type?: string }): Promise<import('@/types/dashboard').FinanceAnalyticsData> => {
        const response = await api.get('/reporting/finance', { params });
        return response.data;
    },

    getHRAnalytics: async (params?: { branchId?: string }): Promise<import('@/types/dashboard').HRAnalyticsData> => {
        const response = await api.get('/reporting/hr', { params });
        return response.data;
    },

    getAcademicAnalytics: async (params?: { branchId?: string }): Promise<import('@/types/dashboard').AcademicAnalyticsData> => {
        const response = await api.get('/reporting/academic', { params });
        return response.data;
    },

    getAttendanceAnalytics: async (params?: { branchId?: string }): Promise<import('@/types/dashboard').AttendanceAnalyticsData> => {
        const response = await api.get('/reporting/attendance', { params });
        return response.data;
    },

    getAcademicReport: async () => {
        const response = await api.get('/reporting/academic');
        return response.data;
    },

    getInventoryReport: async () => {
        // Backend endpoint does not exist yet — return empty data
        try {
            const response = await api.get('/reporting/inventory');
            return response.data;
        } catch {
            return { products: [], totalProducts: 0, totalValue: 0, lowStockItems: [] };
        }
    },

    getHRReport: async () => {
        const response = await api.get('/reporting/hr');
        return response.data;
    },

    // Export methods — corrected to match backend routes
    exportStudentPerformancePDF: async () => {
        const response = await api.get('/reporting/export/performance', {
            params: { format: 'pdf' },
            responseType: 'blob'
        });
        downloadBlob(response, 'student-performance.pdf');
    },

    exportStudentPerformanceExcel: async () => {
        // Backend does not have an Excel export endpoint yet
        try {
            const response = await api.get('/reporting/export/performance', {
                params: { format: 'excel' },
                responseType: 'blob'
            });
            downloadBlob(response, 'student-performance.xlsx');
        } catch {
            devLog.warn('Excel export endpoint not available');
        }
    },

    exportFeesPDF: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        const response = await api.get(`/reporting/export/finance?${params.toString()}`, {
            responseType: 'blob'
        });
        downloadBlob(response, 'fees-report.pdf');
    },

    exportFeesExcel: async (startDate?: string, endDate?: string) => {
        // Backend does not have a finance Excel export endpoint yet
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        try {
            const response = await api.get(`/reporting/export/finance?${params.toString()}`, {
                params: { format: 'excel' },
                responseType: 'blob'
            });
            downloadBlob(response, 'fees-report.xlsx');
        } catch {
            devLog.warn('Fees Excel export endpoint not available');
        }
    },

    exportHRPDF: async () => {
        // Backend does not have an HR PDF export endpoint yet
        try {
            const response = await api.get('/reporting/export/hr', {
                params: { format: 'pdf' },
                responseType: 'blob'
            });
            downloadBlob(response, 'hr-report.pdf');
        } catch {
            devLog.warn('HR export endpoint not available');
        }
    },

    exportHRExcel: async () => {
        try {
            const response = await api.get('/reporting/export/hr', {
                params: { format: 'excel' },
                responseType: 'blob'
            });
            downloadBlob(response, 'hr-report.xlsx');
        } catch {
            devLog.warn('HR Excel export endpoint not available');
        }
    },

    exportInventoryPDF: async () => {
        // Backend does not have an inventory export endpoint yet
        try {
            const response = await api.get('/reporting/export/inventory', {
                params: { format: 'pdf' },
                responseType: 'blob'
            });
            downloadBlob(response, 'inventory-report.pdf');
        } catch {
            devLog.warn('Inventory export endpoint not available');
        }
    },

    exportInventoryExcel: async () => {
        try {
            const response = await api.get('/reporting/export/inventory', {
                params: { format: 'excel' },
                responseType: 'blob'
            });
            downloadBlob(response, 'inventory-report.xlsx');
        } catch {
            devLog.warn('Inventory Excel export endpoint not available');
        }
    },
};
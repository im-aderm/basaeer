import api from '@/lib/api';
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
        const response = await api.get('/reporting/inventory');
        return response.data;
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
        const response = await api.get('/reporting/export/performance', {
            params: { format: 'excel' },
            responseType: 'blob'
        });
        downloadBlob(response, 'student-performance.xlsx');
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
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        const response = await api.get(`/reporting/export/finance?${params.toString()}`, {
            params: { format: 'excel' },
            responseType: 'blob'
        });
        downloadBlob(response, 'fees-report.xlsx');
    },

    exportHRPDF: async () => {
        const response = await api.get('/reporting/export/hr', {
            params: { format: 'pdf' },
            responseType: 'blob'
        });
        downloadBlob(response, 'hr-report.pdf');
    },

    exportHRExcel: async () => {
        const response = await api.get('/reporting/export/hr', {
            params: { format: 'excel' },
            responseType: 'blob'
        });
        downloadBlob(response, 'hr-report.xlsx');
    },

    exportInventoryPDF: async () => {
        const response = await api.get('/reporting/export/inventory', {
            params: { format: 'pdf' },
            responseType: 'blob'
        });
        downloadBlob(response, 'inventory-report.pdf');
    },

    exportInventoryExcel: async () => {
        const response = await api.get('/reporting/export/inventory', {
            params: { format: 'excel' },
            responseType: 'blob'
        });
        downloadBlob(response, 'inventory-report.xlsx');
    },
};
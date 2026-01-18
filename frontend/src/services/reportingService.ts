import api from '@/lib/api';

export interface DashboardData {
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

    // Export methods
    exportStudentPerformancePDF: async () => {
        const response = await api.get('/reporting/export/student-performance/pdf', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'student-performance.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportStudentPerformanceExcel: async () => {
        const response = await api.get('/reporting/export/student-performance/excel', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'student-performance.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportFeesPDF: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        const response = await api.get(`/reporting/export/fees/pdf?${params.toString()}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'fees-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportFeesExcel: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        const response = await api.get(`/reporting/export/fees/excel?${params.toString()}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'fees-report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportHRPDF: async () => {
        const response = await api.get('/reporting/export/hr/pdf', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'hr-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportHRExcel: async () => {
        const response = await api.get('/reporting/export/hr/excel', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'hr-report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportInventoryPDF: async () => {
        const response = await api.get('/reporting/export/inventory/pdf', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inventory-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportInventoryExcel: async () => {
        const response = await api.get('/reporting/export/inventory/excel', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inventory-report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

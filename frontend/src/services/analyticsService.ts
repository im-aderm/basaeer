import api from "@/lib/api";
import type {
    ExecutiveOverview,
    ExecutiveFinance,
    ExecutiveAttendance,
    ExecutiveAcademics,
    BranchKPI,
    TrendDataPoint,
    ExecutiveInsight,
    BranchOverview,
    BranchDailyOps,
    BranchFinance,
    BranchAcademics,
} from "@/types/analytics";

export const analyticsService = {
    // Executive Dashboard
    getExecutiveOverview: async (): Promise<ExecutiveOverview> => {
        const response = await api.get('/analytics/executive/overview');
        return response.data;
    },

    getExecutiveFinance: async (): Promise<ExecutiveFinance> => {
        const response = await api.get('/analytics/executive/finance');
        return response.data;
    },

    getExecutiveAttendance: async (): Promise<ExecutiveAttendance> => {
        const response = await api.get('/analytics/executive/attendance');
        return response.data;
    },

    getExecutiveAcademics: async (): Promise<ExecutiveAcademics> => {
        const response = await api.get('/analytics/executive/academics');
        return response.data;
    },

    getExecutiveBranches: async (): Promise<BranchKPI[]> => {
        const response = await api.get('/analytics/executive/branches');
        return response.data;
    },

    getExecutiveTrends: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<TrendDataPoint[]> => {
        const response = await api.get(`/analytics/executive/trends?period=${period}`);
        return response.data;
    },

    getExecutiveInsights: async (): Promise<ExecutiveInsight[]> => {
        const response = await api.get('/analytics/executive/insights');
        return response.data;
    },

    // Branch Dashboard
    getBranchOverview: async (branchId: string): Promise<BranchOverview> => {
        const response = await api.get(`/analytics/branch/${branchId}/overview`);
        return response.data;
    },

    getBranchDailyOps: async (branchId: string): Promise<BranchDailyOps> => {
        const response = await api.get(`/analytics/branch/${branchId}/daily-ops`);
        return response.data;
    },

    getBranchFinance: async (branchId: string): Promise<BranchFinance> => {
        const response = await api.get(`/analytics/branch/${branchId}/finance`);
        return response.data;
    },

    getBranchAttendance: async (branchId: string): Promise<{ trend: Array<{ date: string; rate: number }> }> => {
        const response = await api.get(`/analytics/branch/${branchId}/attendance`);
        return response.data;
    },

    getBranchAcademics: async (branchId: string): Promise<BranchAcademics> => {
        const response = await api.get(`/analytics/branch/${branchId}/academics`);
        return response.data;
    },
};

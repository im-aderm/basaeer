import api from "@/lib/api";

export interface AuditLogEntry {
    id: string;
    action: string;
    module: string;
    details?: string;
    ipAddress?: string;
    userId: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    branchId?: string;
    createdAt: string;
}

export interface AuditLogResponse {
    items: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const AuditLogService = {
    getLogs: async (params?: {
        module?: string;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<AuditLogResponse> => {
        const response = await api.get("/audit", { params });
        return response.data;
    },
};
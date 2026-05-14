import api from "@/lib/api";

export interface AuditLogEntry {
  id: string;
  action: string;
  module: string;
  details?: string;
  userId: string;
  branchId?: string;
  ipAddress?: string;
  targetId?: string;
  targetType?: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export const AuditLogService = {
  getLogs: async (params: {
    action?: string;
    module?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: AuditLogEntry[]; totalPages: number; total: number }> => {
    const response = await api.get("/audit", { params });
    return response.data ?? { items: [], totalPages: 0, total: 0 };
  },

  getRecent: async (limit = 10): Promise<AuditLogEntry[]> => {
    const response = await api.get("/audit", { params: { limit, page: 1 } });
    return response.data?.items ?? response.data ?? [];
  },
};

export const auditLogService = AuditLogService;

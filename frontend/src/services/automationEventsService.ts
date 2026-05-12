import api from "@/lib/api";

export interface CampusEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    category: string;
    isPublic: boolean;
    allowRSVP: boolean;
    _count?: { rsvps: number };
}

export interface AccessLog {
    id: string;
    userId: string;
    user?: { firstName: string; lastName: string; role: string };
    scanTime: string;
    direction: 'ENTRY' | 'EXIT';
    location?: string;
}

export interface AutomationConfig {
    id?: string;
    type: string;
    isEnabled: boolean;
    template?: string;
    triggerDays?: number;
    branchId?: string;
}

export interface AutomationExecution {
    id: string;
    configId: string;
    status: string;
    executedAt: string;
    result?: string;
    branchId?: string;
    config?: { type: string; isEnabled: boolean };
}

export interface AutomationStats {
    total: number;
    successful: number;
    failed: number;
    last24h: number;
}

export interface QueueHealth {
    metrics: any[];
    recentFailovers: any[];
    providerHealth: any[];
}

export interface DeliveryStats {
    totalDelivered: number;
    totalFailed: number;
    recentDeliveryLogs: any[];
}

export interface AutomationJob {
    id: string;
    name: string;
    cron: string;
    lastRun?: string;
    nextRun?: string;
    status: string;
    lastResult?: string;
    errorCount: number;
    isEnabled: boolean;
}

export const AutomationEventsService = {
    // Events
    getEvents: async (isPublic?: boolean): Promise<CampusEvent[]> => {
        const response = await api.get(`/events${isPublic !== undefined ? `?isPublic=${isPublic}` : ''}`);
        return response.data;
    },
    createEvent: async (data: any) => {
        const response = await api.post('/events', data);
        return response.data;
    },
    rsvpEvent: async (id: string, status: string) => {
        const response = await api.post(`/events/${id}/rsvp`, { status });
        return response.data;
    },

    // Access Control
    logAccess: async (data: { userId: string; direction: 'ENTRY' | 'EXIT'; location?: string }) => {
        const response = await api.post('/access-control/log', data);
        return response.data;
    },
    getLogs: async (limit: number = 50): Promise<AccessLog[]> => {
        const response = await api.get(`/access-control/logs?limit=${limit}`);
        return response.data;
    },

    // Automation Configs
    getConfigs: async (): Promise<AutomationConfig[]> => {
        const response = await api.get('/automation/configs');
        return response.data;
    },
    updateConfig: async (type: string, data: Partial<AutomationConfig>) => {
        const response = await api.put(`/automation/config/${type}`, data);
        return response.data;
    },
    upsertConfig: async (data: Partial<AutomationConfig>) => {
        const response = await api.post('/automation/configs', data);
        return response.data;
    },

    // Automation Jobs
    getJobs: async (): Promise<AutomationJob[]> => {
        const response = await api.get('/automation/jobs');
        return response.data;
    },
    toggleJob: async (id: string, isEnabled: boolean) => {
        const response = await api.patch(`/automation/jobs/${id}/toggle`, { isEnabled });
        return response.data;
    },

    // Automation Health & Metrics
    getExecutions: async (limit: number = 50): Promise<AutomationExecution[]> => {
        const response = await api.get(`/automation/health/executions?limit=${limit}`);
        return response.data;
    },
    getStats: async (): Promise<AutomationStats> => {
        const response = await api.get('/automation/health/stats');
        return response.data;
    },
    getQueueHealth: async (): Promise<QueueHealth> => {
        const response = await api.get('/automation/health/queue-health');
        return response.data;
    },
    getDeliveryStats: async (): Promise<DeliveryStats> => {
        const response = await api.get('/automation/health/delivery-stats');
        return response.data;
    },

    // Seed automation configs
    seedConfigs: async () => {
        const response = await api.get('/automation/seed');
        return response.data;
    },
};

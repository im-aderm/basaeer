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
    type: string;
    isEnabled: boolean;
    template?: string;
    triggerDays?: number;
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

    // Automation
    getConfigs: async (): Promise<AutomationConfig[]> => {
        const response = await api.get('/automation/configs');
        return response.data;
    },
    updateConfig: async (type: string, data: Partial<AutomationConfig>) => {
        const response = await api.put(`/automation/config/${type}`, data);
        return response.data;
    }
};

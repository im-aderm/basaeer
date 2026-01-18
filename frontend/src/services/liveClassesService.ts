import api from "@/lib/api";

export interface LiveClassSession {
    id: string;
    title: string;
    description?: string;
    meetingId: string;
    hostUrl: string;
    participantUrl: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
    host?: { user: { firstName: string; lastName: string } };
    class?: { name: string };
    section?: { name: string };
    subject?: { name: string };
    _count?: { participants: number };
}

export interface GoogleMeetConfig {
    id: string;
    isEnabled: boolean;
    defaultDuration: number;
    allowRecording: boolean;
    requireApproval: boolean;
}

export const LiveClassesService = {
    // Configuration
    getConfig: async (branchId: string): Promise<GoogleMeetConfig> => {
        const response = await api.get(`/live-classes/config/${branchId}`);
        return response.data;
    },

    updateConfig: async (data: any): Promise<GoogleMeetConfig> => {
        const response = await api.post('/live-classes/config', data);
        return response.data;
    },

    testConnection: async (branchId: string): Promise<{ success: boolean }> => {
        const response = await api.post(`/live-classes/test/${branchId}`);
        return response.data;
    },

    // Sessions
    getSessions: async (filters?: any): Promise<LiveClassSession[]> => {
        const response = await api.get('/live-classes', { params: filters });
        return response.data;
    },

    getSessionById: async (id: string): Promise<LiveClassSession> => {
        const response = await api.get(`/live-classes/${id}`);
        return response.data;
    },

    createSession: async (data: any): Promise<LiveClassSession> => {
        const response = await api.post('/live-classes', data);
        return response.data;
    },

    updateSession: async (id: string, data: any): Promise<LiveClassSession> => {
        const response = await api.patch(`/live-classes/${id}`, data);
        return response.data;
    },

    startSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.patch(`/live-classes/${id}/start`);
        return response.data;
    },

    endSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.patch(`/live-classes/${id}/end`);
        return response.data;
    },

    cancelSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.delete(`/live-classes/${id}`);
        return response.data;
    },

    // Participation
    getAttendanceReport: async (id: string): Promise<any> => {
        const response = await api.get(`/live-classes/${id}/attendance`);
        return response.data;
    }
};

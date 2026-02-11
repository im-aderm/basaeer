import api from "@/lib/api";

export interface ReportItem {
    userId: string;
    name: string;
    email: string;
    joinedAt: string;
    leftAt?: string;
    duration?: number;
}

export interface LiveClassSession {
    id: string;
    title: string;
    description?: string;
    meetingId: string;
    meetLink?: string;
    hostUrl?: string;
    participantUrl?: string;
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    timezone: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    recordingId?: string;
    recordingUrl?: string;
    recordingStatus?: string;
    status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
    host?: { user: { firstName: string; lastName: string } };
    class?: { name: string };
    section?: { name: string };
    subject?: { name: string };
    _count?: { participants: number };
    createdAt: string;
}

export interface GoogleMeetConfig {
    id: string;
    branchId: string;
    isEnabled: boolean;
    isAuthorized: boolean;
    defaultDuration: number;
    allowRecording: boolean;
    requireApproval: boolean;
}

export const LiveClassesService = {
    // Configuration
    getConfig: async (branchId: string): Promise<GoogleMeetConfig> => {
        const response = await api.get(`/live-classes/config`);
        return response.data;
    },

    updateConfig: async (data: Partial<GoogleMeetConfig>): Promise<GoogleMeetConfig> => {
        const response = await api.post('/live-classes/config', data);
        return response.data;
    },

    testConnection: async (): Promise<{ success: boolean }> => {
        const response = await api.post(`/live-classes/config/test`);
        return response.data;
    },

    getAuthUrl: async (branchId: string): Promise<{ url: string }> => {
        // This usually redirects or returns a URL to redirect to
        return { url: `${api.defaults.baseURL}/live-classes/auth/google?branchId=${branchId}` };
    },

    // Sessions
    getSessions: async (filters?: Record<string, string | boolean>): Promise<LiveClassSession[]> => {
        const response = await api.get('/live-classes/sessions', { params: filters });
        return response.data;
    },

    getSessionById: async (id: string): Promise<LiveClassSession> => {
        const response = await api.get(`/live-classes/sessions/${id}`);
        return response.data;
    },

    createSession: async (data: Partial<LiveClassSession> & { classId: string; subjectId: string; branchId: string }): Promise<LiveClassSession> => {
        const response = await api.post('/live-classes/sessions', data);
        return response.data;
    },

    updateSession: async (id: string, data: Partial<LiveClassSession>): Promise<LiveClassSession> => {
        const response = await api.patch(`/live-classes/sessions/${id}`, data);
        return response.data;
    },

    startSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.post(`/live-classes/sessions/${id}/start`);
        return response.data;
    },

    endSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.post(`/live-classes/sessions/${id}/end`);
        return response.data;
    },

    cancelSession: async (id: string): Promise<LiveClassSession> => {
        const response = await api.delete(`/live-classes/sessions/${id}`);
        return response.data;
    },

    // Participation
    getAttendanceReport: async (id: string): Promise<ReportItem[]> => {
        const response = await api.get(`/live-classes/sessions/${id}/attendance`);
        return response.data.participants || [];
    },

    recordParticipant: async (id: string, data: { userId: string; action: 'join' | 'leave' }): Promise<any> => {
        const response = await api.post(`/live-classes/sessions/${id}/participants`, data);
        return response.data;
    }
};

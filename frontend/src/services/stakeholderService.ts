import api from "@/lib/api";

export interface Alumni {
    id: string;
    studentId: string;
    student?: any;
    graduationDate: string;
    currentOccupation?: string;
    currentCompany?: string;
    higherEducation?: string;
    linkedInUrl?: string;
    isPublic: boolean;
}

export interface AlumniEvent {
    id: string;
    title: string;
    description?: string;
    eventDate: string;
    location?: string;
    isOnline: boolean;
    meetingUrl?: string;
    participants?: any[];
}

export interface Conversation {
    id: string;
    title?: string;
    lastMessageAt: string;
    participants: any[];
    messages?: Message[];
}

export interface Message {
    id: string;
    content: string;
    conversationId: string;
    senderId: string;
    sender?: any;
    isRead: boolean;
    createdAt: string;
}

export const StakeholderService = {
    // Parent Portal
    getChildren: async () => {
        const response = await api.get('/stakeholder/parent/children');
        return response.data;
    },
    getChildAttendance: async (studentId: string) => {
        const response = await api.get(`/stakeholder/parent/child/${studentId}/attendance`);
        return response.data;
    },
    getChildFinancials: async (studentId: string) => {
        const response = await api.get(`/stakeholder/parent/child/${studentId}/financials`);
        return response.data;
    },

    // Messaging
    getConversations: async () => {
        const response = await api.get('/stakeholder/messaging/conversations');
        return response.data;
    },
    createConversation: async (recipientId: string, title?: string) => {
        const response = await api.post('/stakeholder/messaging/conversation', { recipientId, title });
        return response.data;
    },
    sendMessage: async (conversationId: string, content: string) => {
        const response = await api.post('/stakeholder/messaging/send', { conversationId, content });
        return response.data;
    },

    // Alumni
    getAlumni: async (branchId: string): Promise<Alumni[]> => {
        const response = await api.get(`/stakeholder/alumni?branchId=${branchId}`);
        return response.data;
    },
    createAlumni: async (data: any) => {
        const response = await api.post('/stakeholder/alumni', data);
        return response.data;
    },
    getEvents: async (branchId: string): Promise<AlumniEvent[]> => {
        const response = await api.get(`/stakeholder/alumni/events?branchId=${branchId}`);
        return response.data;
    },
    createEvent: async (data: any) => {
        const response = await api.post('/stakeholder/alumni/event', data);
        return response.data;
    },
    rsvpEvent: async (eventId: string, status: string) => {
        const response = await api.post(`/stakeholder/alumni/event/${eventId}/rsvp`, { status });
        return response.data;
    }
};

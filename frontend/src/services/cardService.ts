import api from "@/lib/api";

export enum IdCardType {
    STUDENT = 'STUDENT',
    EMPLOYEE = 'EMPLOYEE',
    ADMIT = 'ADMIT'
}

export interface IdCardTemplate {
    id: string;
    name: string;
    type: IdCardType;
    backgroundImage?: string;
    config: any;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface IdCard {
    id: string;
    studentId?: string;
    staffId?: string;
    templateId: string;
    sessionId: string;
    status: string;
    issueDate: string;
    student?: any;
    staff?: any;
    template?: IdCardTemplate;
}

export const CardService = {
    // Templates
    getAllTemplates: async (branchId?: string) => {
        const response = await api.get<IdCardTemplate[]>(`/cards/templates${branchId ? `?branchId=${branchId}` : ''}`);
        return response.data;
    },

    getTemplate: async (id: string) => {
        const response = await api.get<IdCardTemplate>(`/cards/templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: Partial<IdCardTemplate>) => {
        const response = await api.post<IdCardTemplate>('/cards/templates', data);
        return response.data;
    },

    updateTemplate: async (id: string, data: Partial<IdCardTemplate>) => {
        const response = await api.patch<IdCardTemplate>(`/cards/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: string) => {
        const response = await api.delete(`/cards/templates/${id}`);
        return response.data;
    },

    // ID Cards
    generateCards: async (data: { templateId: string; sessionId: string; studentIds?: string[]; staffIds?: string[] }) => {
        const response = await api.post<IdCard[]>('/cards/generate', data);
        return response.data;
    },

    getAllCards: async (branchId: string, sessionId: string) => {
        const response = await api.get<IdCard[]>(`/cards?branchId=${branchId}&sessionId=${sessionId}`);
        return response.data;
    },

    getCard: async (id: string) => {
        const response = await api.get<IdCard>(`/cards/${id}`);
        return response.data;
    }
};

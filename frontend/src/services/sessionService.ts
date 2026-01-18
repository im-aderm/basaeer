import api from "@/lib/api";

export interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSessionDto {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export const SessionService = {
    getAll: async (): Promise<AcademicSession[]> => {
        const response = await api.get("/sessions");
        return response.data;
    },

    getActive: async (): Promise<AcademicSession | null> => {
        const response = await api.get("/sessions/active");
        return response.data;
    },

    create: async (data: CreateSessionDto): Promise<AcademicSession> => {
        const response = await api.post("/sessions", data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateSessionDto>): Promise<AcademicSession> => {
        const response = await api.patch(`/sessions/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/sessions/${id}`);
    }
};

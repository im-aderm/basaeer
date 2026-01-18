import api from "@/lib/api";

export interface Subject {
    id: string;
    name: string;
    code?: string;
    branchId: string;
    createdAt: string;
}

export const SubjectService = {
    getAll: async (): Promise<Subject[]> => {
        const response = await api.get("/subjects");
        return response.data;
    },

    create: async (data: any): Promise<Subject> => {
        const response = await api.post("/subjects", data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<Subject> => {
        const response = await api.patch(`/subjects/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/subjects/${id}`);
    },

    assignTeacher: async (subjectId: string, teacherId: string): Promise<Subject> => {
        const response = await api.post(`/subjects/${subjectId}/assign-teacher`, { teacherId });
        return response.data;
    }
};

import api from "@/lib/api";

export interface Section {
    id: string;
    name: string;
    classId: string;
    createdAt: string;
}

export interface Class {
    id: string;
    name: string;
    gradeLevel?: number;
    branchId: string;
    classTeacherId?: string;
    sections: Section[];
    createdAt: string;
}

export const ClassService = {
    getAll: async (): Promise<Class[]> => {
        const response = await api.get("/classes");
        return response.data;
    },

    create: async (data: any): Promise<Class> => {
        const response = await api.post("/classes", data);
        return response.data;
    },

    getById: async (id: string): Promise<Class> => {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    },

    addSection: async (classId: string, name: string): Promise<Section> => {
        const response = await api.post(`/classes/${classId}/sections`, { name });
        return response.data;
    },

    assignTeacher: async (classId: string, teacherId: string): Promise<Class> => {
        const response = await api.post(`/classes/${classId}/assign-teacher`, { teacherId });
        return response.data;
    }
};

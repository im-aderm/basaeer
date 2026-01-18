import api from "@/lib/api";

export interface Student {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    dob?: string;
    branchId: string;
    classId?: string;
    sectionId?: string;
    parentId?: string;
    user?: {
        email: string;
        phone?: string;
    };
    class?: {
        name: string;
    };
    section?: {
        name: string;
    };
    transportAssignment?: any;
    transportRoute?: any;
    transportVehicle?: any;
    certificates?: any[];
    createdAt: string;
}

export interface StudentCategory {
    id: string;
    name: string;
    description?: string;
    branchId: string;
    _count?: {
        students: number;
    };
    createdAt: string;
}

export const StudentService = {
    getAll: async (params?: { classId?: string; sectionId?: string; branchId?: string }): Promise<Student[]> => {
        const response = await api.get("/students", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Student> => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<any> => {
        const response = await api.post("/students", data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await api.patch(`/students/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/students/${id}`);
    },

    // Student Categories
    getCategories: async (branchId: string): Promise<StudentCategory[]> => {
        const response = await api.get("/student-categories", { params: { branchId } });
        return response.data;
    },

    createCategory: async (data: any): Promise<StudentCategory> => {
        const response = await api.post("/student-categories", data);
        return response.data;
    },

    updateCategory: async (id: string, data: any): Promise<StudentCategory> => {
        const response = await api.patch(`/student-categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/student-categories/${id}`);
    },

    importStudents: async (file: File, branchId: string): Promise<any> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/students/import", formData, {
            params: { branchId },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }
};

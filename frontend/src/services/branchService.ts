
import api from "@/lib/api";

export interface Branch {
    id: string;
    name: string;
    code: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBranchDto {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    primaryColor?: string;
    adminUserId?: string;
    createAdminUser?: {
        email: string;
        firstName: string;
        lastName: string;
        password?: string;
        phone?: string;
    };
}

export interface UpdateBranchDto {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    primaryColor?: string;
    isActive?: boolean;
}

export const BranchService = {
    getAll: async (): Promise<Branch[]> => {
        const response = await api.get("/branches");
        return response.data;
    },

    getOne: async (id: string): Promise<Branch> => {
        const response = await api.get(`/branches/${id}`);
        return response.data;
    },

    create: async (data: CreateBranchDto): Promise<Branch> => {
        const response = await api.post("/branches", data);
        return response.data;
    },

    update: async (id: string, data: UpdateBranchDto): Promise<Branch> => {
        const response = await api.patch(`/branches/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/branches/${id}`);
    },

    getActive: async (): Promise<Pick<Branch, 'id' | 'name' | 'code'>[]> => {
        const response = await api.get("/branches/public/active");
        return response.data;
    },
};

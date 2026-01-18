import api from "@/lib/api";

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    branchId?: string;
    createdAt: string;
}

export const UserService = {
    getAll: async (params?: { branchId?: string; role?: string }): Promise<User[]> => {
        const response = await api.get("/users", { params });
        return response.data;
    },

    toggleStatus: async (id: string, isActive: boolean): Promise<User> => {
        const response = await api.patch(`/users/${id}/status`, { isActive });
        return response.data;
    }
};

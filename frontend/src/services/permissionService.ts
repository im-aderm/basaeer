import api from "@/lib/api";

export interface RolePermission {
    id: string;
    role: string;
    module: string;
    action: string;
    isAllowed: boolean;
}

export interface UpdatePermissionDto {
    role: string;
    module: string;
    action: string;
    isAllowed: boolean;
}

export const PermissionService = {
    getAll: async (role?: string): Promise<RolePermission[]> => {
        const response = await api.get("/permissions", { params: { role } });
        return response.data;
    },

    update: async (data: UpdatePermissionDto): Promise<RolePermission> => {
        const response = await api.post("/permissions", data);
        return response.data;
    },

    seed: async (): Promise<void> => {
        await api.post("/permissions/seed");
    }
};

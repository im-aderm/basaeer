import api from "@/lib/api";

export interface Role {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    branchId: string | null;
    isSystem: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
    _count?: {
        users: number;
        permissions: number;
    };
}

export interface RolePermission {
    id: string;
    roleId: string;
    module: string;
    action: string;
    isAllowed: boolean;
}

export const RoleService = {
    async getAll(branchId?: string): Promise<Role[]> {
        const params = branchId ? { branchId } : {};
        const res = await api.get("/roles", { params });
        return res.data?.data ?? res.data ?? [];
    },

    async getOne(id: string): Promise<Role> {
        const res = await api.get(`/roles/${id}`);
        return res.data?.data ?? res.data;
    },

    async create(data: { name: string; slug: string; description?: string; branchId?: string }): Promise<Role> {
        const res = await api.post("/roles", data);
        return res.data?.data ?? res.data;
    },

    async update(id: string, data: Partial<Role>): Promise<Role> {
        const res = await api.patch(`/roles/${id}`, data);
        return res.data?.data ?? res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/roles/${id}`);
    },

    async getPermissions(roleId: string): Promise<RolePermission[]> {
        const res = await api.get(`/roles/${roleId}/permissions`);
        return res.data?.data ?? res.data ?? [];
    },

    async updatePermission(roleId: string, data: { module: string; action: string; isAllowed: boolean }): Promise<RolePermission> {
        const res = await api.post(`/roles/${roleId}/permissions`, data);
        return res.data?.data ?? res.data;
    },

    async bulkUpdatePermissions(roleId: string, permissions: { module: string; action: string; isAllowed: boolean }[]): Promise<any> {
        const res = await api.post(`/roles/${roleId}/permissions/bulk`, permissions);
        return res.data?.data ?? res.data;
    },

    async getUsers(roleId: string): Promise<any[]> {
        const res = await api.get(`/roles/${roleId}/users`);
        return res.data?.data ?? res.data ?? [];
    },

    async assignRole(userId: string, roleId: string): Promise<any> {
        const res = await api.post(`/roles/${roleId}/assign`, { userId, roleId });
        return res.data?.data ?? res.data;
    },

    async removeRole(userId: string): Promise<any> {
        const res = await api.delete(`/roles/users/${userId}`);
        return res.data?.data ?? res.data;
    },
};
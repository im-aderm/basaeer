import api from "@/lib/api";

export interface AttachmentCategory {
    id: string;
    name: string;
    description?: string;
    branchId: string;
    isDeleted: boolean;
    createdAt: string;
    _count?: { resources: number };
}

export interface DigitalResource {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    categoryId: string;
    branchId: string;
    createdAt: string;
}

export const AttachmentService = {
    getCategories: async (branchId: string): Promise<AttachmentCategory[]> => {
        const response = await api.get("/attachments/categories", { params: { branchId } });
        return response.data;
    },

    createCategory: async (data: { name: string; description?: string; branchId?: string }): Promise<AttachmentCategory> => {
        const response = await api.post("/attachments/categories", data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/attachments/categories/${id}`);
    },

    upload: async (
        file: File,
        data: { title: string; categoryId: string; classIds?: string[]; sectionIds?: string[] }
    ): Promise<DigitalResource> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", data.title);
        formData.append("categoryId", data.categoryId);
        if (data.classIds?.length) formData.append("classIds", JSON.stringify(data.classIds));
        if (data.sectionIds?.length) formData.append("sectionIds", JSON.stringify(data.sectionIds));
        const response = await api.post("/attachments/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};

import api from "@/lib/api";

export interface ReportTemplate {
    id: string;
    name: string;
    description?: string;
    type: string;
    layout: any;
    config: any;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const reportTemplateService = {
    getTemplates: async (): Promise<ReportTemplate[]> => {
        const response = await api.get("/academics/templates");
        return response.data;
    },

    getTemplateById: async (id: string): Promise<ReportTemplate> => {
        const response = await api.get(`/academics/templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: Partial<ReportTemplate>): Promise<ReportTemplate> => {
        const response = await api.post("/academics/templates", data);
        return response.data;
    },

    updateTemplate: async (id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> => {
        const response = await api.patch(`/academics/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: string): Promise<void> => {
        await api.delete(`/academics/templates/${id}`);
    },

    preview: async (type: string, layout: any): Promise<string> => {
        const response = await api.post("/academics/templates/preview", { type, layout }, {
            responseType: "text",
        });
        return response.data;
    },
};

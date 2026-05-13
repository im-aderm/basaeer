import api from "@/lib/api";

export interface GlobalSetting {
    id: string;
    key: string;
    value: string;
    branchId?: string;
    createdAt: string;
}

export interface Backup {
    filename: string;
    size: number;
    createdAt: string;
}

export const SettingsService = {
    getSettings: async (): Promise<GlobalSetting[]> => {
        const response = await api.get("/settings");
        return response.data;
    },

    updateSetting: async (key: string, value: string): Promise<GlobalSetting> => {
        const response = await api.post("/settings", { key, value });
        return response.data;
    },

    getBackups: async (): Promise<Backup[]> => {
        const response = await api.get("/backups");
        return response.data;
    },

    createBackup: async (): Promise<Backup> => {
        const response = await api.post("/backups");
        return response.data;
    },

    deleteBackup: async (filename: string): Promise<void> => {
        await api.delete(`/backups/${filename}`);
    },

    downloadBackup: async (filename: string) => {
        const response = await api.get(`/backups/download/${filename}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

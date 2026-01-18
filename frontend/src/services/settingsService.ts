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
    // Global Settings
    getSettings: async (): Promise<GlobalSetting[]> => {
        const response = await api.get("/settings");
        return response.data;
    },

    updateSetting: async (key: string, value: string): Promise<GlobalSetting> => {
        const response = await api.post("/settings", { key, value });
        return response.data;
    },

    // Backups
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

    downloadBackup: (filename: string) => {
        // Use window.location to trigger a browser download
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/backups/download/${filename}`, '_blank');
    }
};

import api from "@/lib/api";

export interface UploadResponse {
    success: boolean;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

export const UploadService = {
    /**
     * Upload an admission document (birth certificate, etc.)
     */
    uploadAdmissionDocument: async (file: File, category?: string): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await api.post<UploadResponse>("/upload/admission-document", formData, {
            params: { category },
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        return response.data;
    },

    /**
     * Upload payment proof
     */
    uploadPaymentProof: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await api.post<UploadResponse>("/upload/payment-proof", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        return response.data;
    },
};

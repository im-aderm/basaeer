import api from "@/lib/api";

export interface PromotionDto {
    studentIds: string[];
    targetClassId: string;
    targetSectionId: string;
}

export const AcademicService = {
    promoteStudents: async (data: PromotionDto): Promise<any> => {
        const response = await api.post("/academics/promote", data);
        return response.data;
    }
};

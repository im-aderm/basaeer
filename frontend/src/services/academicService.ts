import api from "@/lib/api";

export interface PromotionDto {
    studentIds: string[];
    targetClassId: string;
    targetSectionId: string;
}

export interface ClassScheduleDto {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    teacherId: string;
    subject?: { name: string };
    teacher?: { user: { firstName: string, lastName: string } };
}

export const AcademicService = {
    promoteStudents: async (data: PromotionDto): Promise<any> => {
        const response = await api.post("/academics/promote", data);
        return response.data;
    },

    createSchedule: async (data: ClassScheduleDto): Promise<ClassScheduleDto> => {
        const response = await api.post("/academics/schedules", data);
        return response.data;
    },

    getSchedules: async (filters: { classId?: string; sectionId?: string; teacherId?: string }): Promise<ClassScheduleDto[]> => {
        const response = await api.get("/academics/schedules", { params: filters });
        return response.data;
    },

    deleteSchedule: async (id: string): Promise<any> => {
        const response = await api.delete(`/academics/schedules/${id}`);
        return response.data;
    }
};

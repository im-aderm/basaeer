import api from "@/lib/api";

export interface Attendance {
    id: string;
    studentId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
    sectionId?: string;
}

export const AttendanceService = {
    mark: async (data: any): Promise<Attendance> => {
        const response = await api.post("/attendance", data);
        return response.data;
    },

    getBySection: async (sectionId: string, date: string): Promise<any[]> => {
        const response = await api.get(`/attendance/section`, {
            params: { sectionId, date }
        });
        return response.data;
    },

    getStudentAttendance: async (studentId: string): Promise<Attendance[]> => {
        const response = await api.get(`/attendance/student/${studentId}`);
        return response.data;
    }
};

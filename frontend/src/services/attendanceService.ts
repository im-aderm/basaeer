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

    markBulk: async (records: any[]): Promise<any> => {
        const response = await api.post("/attendance/bulk", { records });
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
    },

    // Staff Attendance
    markStaff: async (data: any): Promise<any> => {
        const response = await api.post("/employees/attendance", data);
        return response.data;
    },

    markStaffBulk: async (records: any[]): Promise<any> => {
        const response = await api.post("/employees/attendance/bulk", { records });
        return response.data;
    },

    getStaffByBranch: async (date: string): Promise<any[]> => {
        const response = await api.get(`/employees/attendance/branch`, {
            params: { date }
        });
        return response.data;
    },

    getStaffHistory: async (staffId: string): Promise<any[]> => {
        const response = await api.get(`/employees/${staffId}/attendance`);
        return response.data;
    },

    getStats: async (): Promise<{
        totalStudents: number;
        studentsPresent: number;
        totalStaff: number;
        staffPresent: number;
    }> => {
        const response = await api.get("/attendance/stats");
        return response.data;
    }
};

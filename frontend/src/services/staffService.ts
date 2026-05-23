import api from "@/lib/api";

export interface Teacher {
    id: string;
    userId: string;
    designation?: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    }
}

export interface Staff {
    id: string;
    userId: string;
    designationId?: string;
    departmentId?: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    designationRef?: {
        name: string;
    };
    department?: {
        name: string;
    };
}

export const StaffService = {
    getAllStaff: async (): Promise<Staff[]> => {
        const response = await api.get("/employees");
        return response.data;
    },

    getAllTeachers: async (): Promise<Teacher[]> => {
        const response = await api.get("/employees/teachers");
        return response.data;
    },

    createTeacher: async (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    }): Promise<Teacher> => {
        const response = await api.post("/employees", { ...data, role: "TEACHER" });
        const { user, staff } = response.data;
        return {
            id: staff.id,
            userId: user.id,
            designation: staff.designation,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        };
    },

    getStaffMember: async (id: string): Promise<any> => {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    }
};

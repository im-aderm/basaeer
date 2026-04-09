import api from "@/lib/api";

export interface UserBasicInfo { id?: string; firstName?: string; lastName?: string; email?: string; phone?: string; role?: string; }
export interface ParentBasicInfo { id?: string; userId?: string; user?: UserBasicInfo; }
export interface ClassBasicInfo { id?: string; name: string; gradeLevel?: number; }
export interface SectionBasicInfo { id?: string; name: string; classId?: string; }
export interface RouteBasicInfo { id?: string; name: string; }
export interface VehicleBasicInfo { id?: string; numberPlate: string; }
export interface CertificateBasicInfo { id?: string; name: string; issueDate?: string; }
export interface AttendanceBasicInfo { id?: string; date: string; status: string; }
export interface StudentStats { total: number; active: number; inactive: number; newAdmissions?: number; }

export interface Student {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    medicalConditions?: string;
    specialNeeds?: string;
    familyDoctorName?: string;
    familyDoctorPhone?: string;
    guardianOccupation?: string;
    guardianOfficeAddress?: string;
    secondaryGuardianName?: string;
    secondaryGuardianPhone?: string;
    secondaryGuardianRelation?: string;
    city?: string;
    state?: string;
    country?: string;
    placeOfBirth?: string;
    nationality?: string;
    stateOfOrigin?: string;
    lga?: string;
    religion?: string;
    passportPhoto?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    dob?: string;
    user?: UserBasicInfo;
    parent?: ParentBasicInfo;
    class?: ClassBasicInfo;
    classId?: string;
    section?: SectionBasicInfo;
    sectionId?: string;
    transportAssignment?: {
        route?: RouteBasicInfo;
        vehicle?: VehicleBasicInfo;
    };
    certificates?: CertificateBasicInfo[];
    attendance?: AttendanceBasicInfo[];
    birthCertificateUrl?: string;
    testimonialUrl?: string;
    transferCertificateUrl?: string;
    immunizationCardUrl?: string;
    preferredLanguage?: string;
    religionClassType?: string;
    scholarshipEligible?: boolean;
    referralSource?: string;
    createdAt: string;
}

export interface StudentCategory {
    id: string;
    name: string;
    description?: string;
    branchId: string;
    _count?: {
        students: number;
    };
    createdAt: string;
}

export const StudentService = {
    getAll: async (params?: { classId?: string; sectionId?: string; branchId?: string }): Promise<Student[]> => {
        const response = await api.get("/students", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Student> => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    create: async (data: Partial<Student>): Promise<Student> => {
        const response = await api.post("/students", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Student>): Promise<Student> => {
        const response = await api.patch(`/students/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/students/${id}`);
    },

    // Student Categories
    getCategories: async (branchId: string): Promise<StudentCategory[]> => {
        const response = await api.get("/student-categories", { params: { branchId } });
        return response.data;
    },

    createCategory: async (data: Partial<StudentCategory>): Promise<StudentCategory> => {
        const response = await api.post("/student-categories", data);
        return response.data;
    },

    updateCategory: async (id: string, data: Partial<StudentCategory>): Promise<StudentCategory> => {
        const response = await api.patch(`/student-categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/student-categories/${id}`);
    },

    importStudents: async (file: File, branchId: string): Promise<{ success: boolean; count: number; message: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/students/import", formData, {
            params: { branchId },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },

    getStats: async (branchId?: string): Promise<StudentStats> => {
        const response = await api.get("/students/stats", { params: { branchId } });
        return response.data;
    }
};


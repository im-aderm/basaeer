import api from "@/lib/api";

export interface OnlineAdmission {
    id: string;
    admissionNumber?: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    gender: string;
    dateOfBirth: string;
    placeOfBirth?: string;
    nationality?: string;
    stateOfOrigin?: string;
    lga?: string;
    religion?: string;
    passportPhoto?: string;

    academicSessionId?: string;
    admissionTerm?: string;
    desiredClassId: string;
    desiredSectionId?: string;
    admissionType?: string;
    previousSchool?: string;
    transferReason?: string;
    assessmentScore?: number;
    status: string;

    guardianName: string;
    guardianRelation?: string;
    guardianPhone: string;
    guardianEmail?: string;
    guardianAddress?: string;
    guardianOccupation?: string;
    guardianOfficeAddress?: string;
    secondaryGuardianName?: string;
    secondaryGuardianPhone?: string;
    secondaryGuardianRelation?: string;

    address?: string;
    city?: string;
    state?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    medicalConditions?: string;
    specialNeeds?: string;
    familyDoctorName?: string;
    familyDoctorPhone?: string;

    hostelRequired: boolean;
    preferredHostel?: string;
    hostelNotes?: string;
    transportRequired: boolean;
    pickupLocation?: string;
    preferredRoute?: string;

    birthCertificateUrl?: string;
    testimonialUrl?: string;
    transferCertificateUrl?: string;
    immunizationCardUrl?: string;

    branchId: string;
    studentStatus: string;
    createPortalAccount: boolean;

    guardianConsent: boolean;
    dataProcessingConsent: boolean;
    schoolRulesAgreement: boolean;
    signature?: string;
    consentDate?: string;

    studentEmail?: string;
    portalUsername?: string;
    preferredLanguage?: string;
    religionClassType?: string;
    scholarshipEligible: boolean;
    referralSource?: string;

    createdAt: string;
    updatedAt: string;

    // Payment Info
    paymentReceiptUrl?: string;
    paymentStatus?: string;
    paymentMethod?: string;

    desiredClass?: any;
    desiredSection?: any;
    academicSession?: any;
    studentCategory?: any;

    // Legacy
    email?: string;
    phone?: string;
}

export const OnlineAdmissionService = {
    getAll: async (branchId: string): Promise<OnlineAdmission[]> => {
        const response = await api.get("/online-admissions", { params: { branchId } });
        return response.data;
    },

    create: async (data: any): Promise<OnlineAdmission> => {
        const response = await api.post("/online-admissions", data);
        return response.data;
    },

    getById: async (id: string): Promise<OnlineAdmission> => {
        const response = await api.get(`/online-admissions/${id}`);
        return response.data;
    },

    approve: async (id: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/approve`);
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await api.patch(`/online-admissions/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/online-admissions/${id}`);
    },

    getPublicInitData: async (branchId: string): Promise<any> => {
        const response = await api.get(`/online-admissions/public/init/${branchId}`);
        return response.data;
    }
};

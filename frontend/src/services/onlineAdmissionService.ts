import api from "@/lib/api";

export interface PreviousSchool {
    id?: string;
    institutionName: string;
    address?: string;
    fromYear?: string;
    toYear?: string;
}

export interface OnlineAdmission {
    id: string;
    admissionNumber?: string;
    firstName: string;
    surname?: string;
    lastName: string;
    otherNames?: string;
    gender: string;
    dateOfBirth: string;
    age?: number;
    ninNumber?: string;
    placeOfBirth?: string;
    nationality?: string;
    stateOfOrigin?: string;
    lga?: string;
    religion?: string;
    passportPhoto?: string;
    passportPhoto2?: string;
    passportPhoto3?: string;
    passportPhoto4?: string;

    academicSessionId?: string;
    admissionTerm?: string;
    desiredClassId: string;
    desiredSectionId?: string;
    admissionType?: string;
    previousSchools?: PreviousSchool[];
    transferReason?: string;
    assessmentScore?: number;
    status: string;
    rejectionReason?: string;

    guardianName: string;
    guardianRelation?: string;
    guardianPhone: string;
    guardianEmail?: string;
    guardianAddress?: string;
    guardianOccupation?: string;
    guardianOfficeAddress?: string;
    
    fatherName?: string;
    fatherOccupation?: string;
    fatherPhone?: string;
    motherName?: string;
    motherOccupation?: string;
    motherPhone?: string;
    
    guardianContact1?: string;
    guardianContact2?: string;

    secondaryGuardianName?: string;
    secondaryGuardianPhone?: string;
    secondaryGuardianRelation?: string;

    address?: string;
    whatsappNumber?: string;
    languagesSpoken?: string;
    city?: string;
    state?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    emergencySickness?: string;

    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    medicalConditions?: string;
    hasMedicalCondition: boolean;
    medicalConditionInfo?: string;
    hasLearningDifficulty: boolean;
    learningDifficultyInfo?: string;
    hasSpecialNeeds: boolean;
    specialNeedsInfo?: string;
    familyDoctorName?: string;
    familyDoctorPhone?: string;

    hasAppliedBefore: boolean;
    howHeard?: string;
    seekingFinancialAid: boolean;
    hasSiblingsInSchool: boolean;
    siblingName?: string;
    siblingLevel?: string;

    birthCertificateUrl?: string;
    testimonialUrl?: string;
    transferCertificateUrl?: string;
    immunizationCardUrl?: string;
    ninUrl?: string;
    educationalCertUrl?: string;
    transferLetterUrl?: string;
    medicalReportUrl?: string;
    recommendationLetterUrl?: string;
    schoolReportUrl?: string;
    paymentProofUrl?: string;

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
    parentId?: string;
}

export const OnlineAdmissionService = {
    getAll: async (branchId: string, status?: string): Promise<OnlineAdmission[]> => {
        const params: any = { branchId };
        if (status) params.status = status;
        const response = await api.get("/online-admissions", { params });
        return response.data;
    },

    create: async (data: any): Promise<OnlineAdmission> => {
        const payload = {
            firstName: data.firstName,
            lastName: data.surname || data.lastName || "",
            otherNames: data.middleName || data.otherNames || "",
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : undefined,
            address: data.address || undefined,
            stateOfOrigin: data.stateOfOrigin || undefined,
            nationality: data.nationality || undefined,
            genotype: data.genotype || undefined,
            bloodGroup: data.bloodGroup || undefined,
            email: data.email || undefined,
            phone: data.phoneNumber || data.phone || undefined,

            admissionType: data.admissionType || "NEW",
            desiredClassId: data.desiredClassId,
            desiredSectionId: data.desiredSectionId || undefined,
            academicSessionId: data.academicSessionId || undefined,
            previousSchools: data.previousSchools || [],
            transferReason: data.transferReason || undefined,

            guardianName: data.guardianName,
            guardianRelation: data.guardianRelation || undefined,
            guardianPhone: data.guardianContact1 || data.guardianPhone || data.phoneNumber || data.phone || "",
            guardianEmail: data.guardianEmail || undefined,
            guardianAddress: data.guardianAddress || undefined,
            guardianOccupation: data.guardianOccupation || undefined,

            passportPhoto: data.passportPhoto || undefined,
            birthCertificateUrl: data.birthCertificateUrl || undefined,
            transferCertificateUrl: data.transferCertificateUrl || undefined,
            paymentReceiptUrl: data.paymentProofUrl || data.paymentReceiptUrl || undefined,
            schoolRulesAgreement: data.schoolRulesAgreement || false,

            branchId: data.desiredBranchId || data.branchId,
        };

        const response = await api.post("/online-admissions", payload);
        return response.data;
    },

    getById: async (id: string): Promise<OnlineAdmission> => {
        const response = await api.get(`/online-admissions/${id}`);
        return response.data;
    },

    approve: async (id: string, approvalData?: { classId?: string, sectionId?: string }): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/approve`, approvalData);
        return response.data;
    },

    reject: async (id: string, reason: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/reject`, { reason });
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await api.patch(`/online-admissions/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/online-admissions/${id}`);
    },

    verifyPayment: async (id: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/verify-payment`);
        return response.data;
    },

    getPublicInitData: async (branchId: string): Promise<any> => {
        const response = await api.get(`/online-admissions/public/init/${branchId}`);
        return response.data;
    },

    importAdmissions: async (file: File, branchId: string): Promise<any> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("branchId", branchId);

        const response = await api.post("/online-admissions/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    getPipeline: async (): Promise<Record<string, number>> => {
        const response = await api.get("/online-admissions/pipeline");
        return response.data;
    },

    makeOffer: async (id: string, data: {
        offeredClassId?: string;
        offeredSectionId?: string;
        reassignmentReason?: string;
        offerDeadline?: string;
    }): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/make-offer`, data);
        return response.data;
    },

    acceptOffer: async (id: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/accept-offer`);
        return response.data;
    },

    declineOffer: async (id: string, reason: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/decline-offer`, { reason });
        return response.data;
    },

    addToWaitlist: async (id: string, data?: { position?: number; notes?: string }): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/waitlist`, data);
        return response.data;
    },

    advanceFromWaitlist: async (id: string): Promise<any> => {
        const response = await api.post(`/online-admissions/${id}/advance-waitlist`);
        return response.data;
    }
};

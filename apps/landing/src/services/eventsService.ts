import api from "@/lib/api";

export interface EventPackage {
  id?: string;
  title: string;
  ageRange?: string;
  timing?: string;
  fee: number;
  boardingType: string; // DAY, BOARDING, FULL_BOARDING
  availableSlots?: number;
  description?: string;
}

export interface EventSchedule {
  id?: string;
  day: string;
  period?: string;
  startTime: string;
  endTime: string;
  activity: string;
}

export interface EventGallery {
  id?: string;
  imageUrl: string;
  isCover?: boolean;
  order?: number;
  caption?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  objectives: string[];
  rulesAndDiscipline?: string;
  requirements: string[];
  mealsAndHospitality?: string;
  whyChooseThisEvent: string[];
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
  location?: string;
  categoryLabel: string;
  isPublic: boolean;
  allowRSVP: boolean;
  branchId: string;
  status: string; // DRAFT, ACTIVE, COMPLETED, CANCELLED
  active: boolean;
  featuredImage?: string;
  brochurePdf?: string;
  capacity?: number;
  registrationOpen: boolean;
  applicationFormEnabled: boolean;
  paymentRequired: boolean;
  seoMetadata?: any;
  createdAt: string;
  updatedAt: string;
  packages?: EventPackage[];
  schedules?: EventSchedule[];
  gallery?: EventGallery[];
  _count?: {
    rsvps: number;
    applications: number;
  };
}

export interface EventApplication {
  id: string;
  eventId: string;
  packageId: string;
  branchId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  state?: string;
  localGovernment?: string;
  memorizationLevel?: string;
  school?: string;
  islamicBackground?: string;
  previousParticipation?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContact: string;
  accommodationPreference?: string;
  passportPhotoUrl?: string;
  birthCertificateUrl?: string;
  ninUrl?: string;
  schoolIdUrl?: string;
  medicalReportUrl?: string;
  proofOfPaymentUrl?: string;
  status: string; // PENDING, UNDER_REVIEW, APPROVED, REJECTED, WAITLISTED
  paymentStatus: string; // PENDING, VERIFIED, REJECTED
  createdAt: string;
  updatedAt: string;
  event?: { title: string; slug: string };
  package?: { title: string; fee: string | number };
  branch?: { name: string };
}

export interface EventAnalytics {
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalApplicants: number;
    revenueGenerated: number;
    pendingApprovals: number;
    occupancyRate: number;
  };
  packagePopularity: { name: string; value: number }[];
  genderDistribution: { name: string; value: number }[];
  ageDistribution: { name: string; value: number }[];
  applicationsOverTime: { name: string; applications: number }[];
}

export const EventsService = {
  // Public Client Endpoints
  getPublicEvents: async (branchId?: string, category?: string): Promise<CampusEvent[]> => {
    let url = "/events/public";
    const params = [];
    if (branchId) params.push(`branchId=${branchId}`);
    if (category) params.push(`category=${category}`);
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getPublicEventBySlug: async (slug: string): Promise<CampusEvent> => {
    const response = await api.get(`/events/public/${slug}`);
    return response.data;
  },

  submitApplication: async (slug: string, data: any, captchaToken?: string): Promise<EventApplication> => {
    const response = await api.post(`/events/public/${slug}/apply${captchaToken ? `?captchaToken=${captchaToken}` : ""}`, data);
    return response.data;
  },

  // Admin Dashboard CRUD
  getEvents: async (isPublic?: boolean): Promise<CampusEvent[]> => {
    const url = `/events${isPublic !== undefined ? `?isPublic=${isPublic}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  getEventDetails: async (id: string): Promise<CampusEvent> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: any): Promise<CampusEvent> => {
    const response = await api.post("/events", data);
    return response.data;
  },

  updateEvent: async (id: string, data: any): Promise<CampusEvent> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  rsvpEvent: async (id: string, status: "INTERESTED" | "GOING" | "DECLINED"): Promise<any> => {
    const response = await api.post(`/events/${id}/rsvp`, { status });
    return response.data;
  },

  // Applications
  getAllApplications: async (): Promise<EventApplication[]> => {
    const response = await api.get("/events/applications/all");
    return response.data;
  },

  getEventApplications: async (eventId: string): Promise<EventApplication[]> => {
    const response = await api.get(`/events/${eventId}/applications`);
    return response.data;
  },

  getApplicationDetails: async (id: string): Promise<EventApplication> => {
    const response = await api.get(`/events/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id: string, status: string): Promise<EventApplication> => {
    const response = await api.patch(`/events/applications/${id}/status`, { status });
    return response.data;
  },

  verifyPayment: async (
    id: string,
    paymentStatus: string,
    discount?: { discountType: 'PERCENTAGE' | 'FIXED'; discountValue: number; discountReason: string },
  ): Promise<EventApplication> => {
    const response = await api.patch(`/events/applications/${id}/payment`, { paymentStatus, ...(discount || {}) });
    return response.data;
  },

  deleteApplication: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/events/applications/${id}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (): Promise<EventAnalytics> => {
    const response = await api.get("/events/analytics");
    return response.data;
  },
};

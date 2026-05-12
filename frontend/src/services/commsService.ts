import api from '@/lib/api';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: string;
    variables?: any;
}

export interface SmsTemplate {
    id: string;
    name: string;
    content: string;
    type: string;
    variables?: any;
}

export interface Campaign {
    id: string;
    name: string;
    type: 'EMAIL' | 'SMS';
    status: string;
    createdAt: string;
    recipientCount?: number;
}

export interface CampaignDetail extends Campaign {
    recipients: {
        id: string;
        status: string;
        user?: { firstName: string; lastName: string; email: string; phone: string };
    }[];
}

export interface AutomationConfig {
    id: string;
    type: string;
    isEnabled: boolean;
    template?: string;
    branchId: string;
}

export interface ProviderHealth {
    email: boolean;
    sms: boolean;
}

export interface SmsBalance {
    provider: string;
    balance: number;
}

export const commsService = {
    // Campaigns
    sendBulkEmail: (data: { subject: string; message: string; recipientGroup: string }) =>
        api.post('/comms/bulk-email', data),
    
    sendBulkSms: (data: { message: string; recipientGroup: string }) =>
        api.post('/comms/bulk-sms', data),
    
    getCampaigns: () => api.get<Campaign[]>('/comms/campaigns'),

    getCampaignDetails: (id: string) => api.get<CampaignDetail>(`/comms/campaigns/${id}`),

    // Email Templates
    getEmailTemplates: () => api.get<EmailTemplate[]>('/comms/templates/email'),
    createEmailTemplate: (data: Partial<EmailTemplate>) => api.post('/comms/templates/email', data),
    updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => api.put(`/comms/templates/email/${id}`, data),

    // SMS Templates
    getSmsTemplates: () => api.get<SmsTemplate[]>('/comms/templates/sms'),
    createSmsTemplate: (data: Partial<SmsTemplate>) => api.post('/comms/templates/sms', data),
    updateSmsTemplate: (id: string, data: Partial<SmsTemplate>) => api.put(`/comms/templates/sms/${id}`, data),

    // Automation / Birthday
    getAutomationConfigs: () => api.get<AutomationConfig[]>('/automation/configs'),
    upsertAutomationConfig: (data: any) => api.post('/automation/configs', data),
    updateAutomationConfig: (type: string, data: any) => api.put(`/automation/config/${type}`, data),

    // Provider Health
    getProviderHealth: () => api.get<ProviderHealth>('/providers/health'),
    getSmsBalance: () => api.get<SmsBalance>('/providers/sms/balance'),
};

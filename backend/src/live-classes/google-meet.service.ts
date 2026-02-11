import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { google } from 'googleapis';
import { EncryptionService } from './encryption.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleMeetService {
    constructor(
        private prisma: PrismaService,
        private encryption: EncryptionService
    ) { }

    private getOAuth2Client(config?: any) {
        const clientId = process.env.GOOGLE_MEET_CLIENT_ID || config?.clientId;
        const clientSecret = process.env.GOOGLE_MEET_CLIENT_SECRET || (config?.clientSecret ? this.encryption.decrypt(config.clientSecret) : null);
        const redirectUri = process.env.GOOGLE_MEET_REDIRECT_URI || config?.redirectUri;

        if (!clientId || !clientSecret || !redirectUri) {
            throw new BadRequestException('Google Meet Client ID, Secret, or Redirect URI is not configured');
        }

        return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    async getAuthUrl(branchId: string) {
        const config = await this.prisma.googleMeetConfig.findUnique({ where: { branchId } });
        const oauth2Client = this.getOAuth2Client(config);

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: (process.env.GOOGLE_MEET_SCOPES || config?.scopes || 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly').split(' '),
            prompt: 'consent',
            state: branchId,
        });
    }

    async setTokens(branchId: string, code: string) {
        const config = await this.prisma.googleMeetConfig.findUnique({ where: { branchId } });
        const oauth2Client = this.getOAuth2Client(config);

        const { tokens } = await oauth2Client.getToken(code);

        await this.prisma.googleMeetConfig.update({
            where: { branchId },
            data: {
                accessToken: tokens.access_token ? this.encryption.encrypt(tokens.access_token) : undefined,
                refreshToken: tokens.refresh_token ? this.encryption.encrypt(tokens.refresh_token) : undefined,
                expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                isEnabled: true,
            },
        });

        return tokens;
    }

    private async getAuthorizedClient(branchId: string) {
        const config = await this.prisma.googleMeetConfig.findUnique({ where: { branchId } });
        if (!config || !config.isEnabled) {
            throw new BadRequestException('Google Meet is not configured or enabled for this branch');
        }

        const oauth2Client = this.getOAuth2Client(config);

        if (!config.accessToken || !config.refreshToken) {
            throw new BadRequestException('Google Meet tokens are missing. Please authorize the application.');
        }

        oauth2Client.setCredentials({
            access_token: this.encryption.decrypt(config.accessToken),
            refresh_token: this.encryption.decrypt(config.refreshToken),
            expiry_date: config.expiryDate?.getTime(),
        });

        // Check if token is expired and refresh if necessary
        if (config.expiryDate && config.expiryDate.getTime() < Date.now()) {
            const { credentials } = await oauth2Client.refreshAccessToken();
            await this.prisma.googleMeetConfig.update({
                where: { branchId },
                data: {
                    accessToken: credentials.access_token ? this.encryption.encrypt(credentials.access_token) : undefined,
                    expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
                },
            });
        }

        return oauth2Client;
    }

    async createMeeting(params: {
        branchId: string;
        title: string;
        description?: string;
        startTime: Date;
        endTime: Date;
        hostEmail: string;
        attendees?: string[];
    }) {
        const authClient = await this.getAuthorizedClient(params.branchId);
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        try {
            const event = {
                summary: params.title,
                description: params.description || '',
                start: {
                    dateTime: params.startTime.toISOString(),
                },
                end: {
                    dateTime: params.endTime.toISOString(),
                },
                attendees: params.attendees?.map(email => ({ email })) || [],
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' },
                    },
                },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                conferenceDataVersion: 1,
                requestBody: event,
            });

            const meetingData = response.data;
            const meetLink = meetingData.hangoutLink || meetingData.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

            if (!meetLink) {
                throw new Error('Failed to create Google Meet conference');
            }

            return {
                meetingId: meetingData.id!,
                hostUrl: meetLink,
                participantUrl: meetLink,
                hangoutLink: meetingData.hangoutLink!,
            };
        } catch (error: any) {
            throw new BadRequestException(`Failed to create Google Meet: ${error.message}`);
        }
    }

    async deleteMeeting(branchId: string, eventId: string) {
        const authClient = await this.getAuthorizedClient(branchId);
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            return { success: true };
        } catch (error: any) {
            throw new BadRequestException(`Failed to delete meeting: ${error.message}`);
        }
    }

    async testConnection(branchId: string): Promise<{ success: boolean; message: string }> {
        try {
            const authClient = await this.getAuthorizedClient(branchId);
            const calendar = google.calendar({ version: 'v3', auth: authClient });

            await calendar.calendarList.list();

            return {
                success: true,
                message: 'Successfully connected to Google Calendar API',
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
            };
        }
    }
}

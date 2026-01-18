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

    private async getAuthClient(branchId: string) {
        const config = await this.prisma.googleMeetConfig.findUnique({
            where: { branchId }
        });

        if (!config || !config.isEnabled) {
            throw new BadRequestException('Google Meet is not configured or enabled for this branch');
        }

        try {
            const serviceAccountJson = this.encryption.decrypt(config.serviceAccountJson);
            const credentials = JSON.parse(serviceAccountJson);

            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: [
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/calendar.events',
                ],
            });

            return auth.getClient();
        } catch (error) {
            throw new BadRequestException(`Failed to initialize Google API client: ${error.message}`);
        }
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
        const authClient = await this.getAuthClient(params.branchId);
        const calendar = google.calendar({ version: 'v3', auth: authClient as any });

        try {
            const event = {
                summary: params.title,
                description: params.description || '',
                start: {
                    dateTime: params.startTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: params.endTime.toISOString(),
                    timeZone: 'UTC',
                },
                attendees: params.attendees?.map(email => ({ email })) || [],
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' },
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 10 },
                    ],
                },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                conferenceDataVersion: 1,
                requestBody: event,
            });

            const meetingData = response.data;
            const conferenceData = meetingData.conferenceData;

            if (!conferenceData || !conferenceData.entryPoints) {
                throw new Error('Failed to create Google Meet conference');
            }

            const meetLink = conferenceData.entryPoints.find(
                ep => ep.entryPointType === 'video'
            )?.uri;

            return {
                meetingId: meetingData.id,
                hostUrl: meetLink,
                participantUrl: meetLink,
                hangoutLink: meetingData.hangoutLink,
            };
        } catch (error) {
            throw new BadRequestException(`Failed to create Google Meet: ${error.message}`);
        }
    }

    async deleteMeeting(branchId: string, eventId: string) {
        const authClient = await this.getAuthClient(branchId);
        const calendar = google.calendar({ version: 'v3', auth: authClient as any });

        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            return { success: true };
        } catch (error) {
            throw new BadRequestException(`Failed to delete meeting: ${error.message}`);
        }
    }

    async testConnection(branchId: string): Promise<{ success: boolean; message: string }> {
        try {
            const authClient = await this.getAuthClient(branchId);
            const calendar = google.calendar({ version: 'v3', auth: authClient as any });

            // Test by listing calendars
            await calendar.calendarList.list();

            return {
                success: true,
                message: 'Successfully connected to Google Calendar API',
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
            };
        }
    }
}

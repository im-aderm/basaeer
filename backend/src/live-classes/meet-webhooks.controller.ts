import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { LiveClassesService } from './live-classes.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Google Meet Webhooks')
@Controller('live-classes/webhooks')
export class MeetWebhooksController {
  private readonly logger = new Logger(MeetWebhooksController.name);

  constructor(private readonly liveClassesService: LiveClassesService) {}

  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Handle Google Webhook' })
  @Post()
  async handleGoogleWebhook(
    @Headers('x-goog-channel-id') channelId: string,
    @Headers('x-goog-resource-id') resourceId: string,
    @Headers('x-goog-resource-state') state: string,
    @Headers('x-goog-channel-token') channelToken: string,
    @Body() body: any,
  ) {
    // Google Calendar push notifications carry back whatever token was
    // supplied when the watch channel was created — verify it matches
    // ours (constant-time, same pattern as auth.controller.ts's bootstrap
    // token check) so an attacker can't forge recording/status updates.
    const webhookSecret = process.env.GOOGLE_MEET_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expected = Buffer.from(webhookSecret, 'utf8');
      const provided = Buffer.from(channelToken || '', 'utf8');
      if (
        expected.length !== provided.length ||
        !crypto.timingSafeEqual(expected, provided)
      ) {
        throw new ForbiddenException('Invalid webhook channel token.');
      }
    } else {
      this.logger.warn(
        'GOOGLE_MEET_WEBHOOK_SECRET is not set — accepting unverified Google Meet webhook calls.',
      );
    }

    if (state === 'sync') return { success: true };

    // Handle event changes
    // This is where we'd trigger a sync of recording links or attendance
    this.logger.debug(
      `Received Google Webhook: Channel=${channelId}, State=${state}`,
    );

    // Logic to find the session by meetingId and update recording/status
    // For now, we'll implement the service method to handle this sync

    return { success: true };
  }
}

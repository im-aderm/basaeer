import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
    @Body() body: any,
  ) {
    // Verify webhook secret if configured
    const webhookSecret = process.env.GOOGLE_MEET_WEBHOOK_SECRET;
    // In a real scenario, you'd check headers for validation tokens

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

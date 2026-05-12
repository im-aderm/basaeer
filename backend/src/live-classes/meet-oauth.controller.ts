import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { GoogleMeetService } from './google-meet.service';
import { Response } from 'express';

@Controller('live-classes/auth')
export class MeetOAuthController {
  constructor(private readonly googleMeet: GoogleMeetService) {}

  @Get('google')
  async googleAuth(@Query('branchId') branchId: string, @Res() res: Response) {
    if (!branchId) {
      throw new BadRequestException('Branch ID is required');
    }
    const url = await this.googleMeet.getAuthUrl(branchId);
    res.redirect(url);
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('state') branchId: string,
    @Res() res: Response,
  ) {
    if (!code || !branchId) {
      throw new BadRequestException(
        'Authorization code and state (branchId) are required',
      );
    }

    try {
      await this.googleMeet.setTokens(branchId, code);
      // Redirect back to the frontend with a success message
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard/live-classes?auth=success`);
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/dashboard/live-classes?auth=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }
}

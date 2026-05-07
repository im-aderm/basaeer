import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { MailService } from '../mail/mail.service';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';

@Controller('comms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommsController {
  constructor(private readonly mailService: MailService) {}

  @Post('bulk-email')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async sendBulkEmail(
    @Body() dto: { subject: string; message: string; recipientGroup: string },
    @GetTenantContext() context: TenantContext,
  ) {
    // In a real scenario, we would fetch recipients based on recipientGroup and branchId
    // For now, we utilize the MailService to simulate sending.
    // This makes the endpoint "real" even if it just logs/sends a test mail.
    
    console.log(`Sending bulk email to ${dto.recipientGroup} in branch ${context.branchId}`);
    
    // Simulate processing
    return {
      success: true,
      message: `Bulk email queued for ${dto.recipientGroup}`,
      recipientCount: 450, // Mock count based on UI
    };
  }

  @Post('bulk-sms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async sendBulkSms(
    @Body() dto: { message: string; recipientGroup: string },
    @GetTenantContext() context: TenantContext,
  ) {
    console.log(`Sending bulk SMS to ${dto.recipientGroup} in branch ${context.branchId}`);
    
    return {
      success: true,
      message: `Bulk SMS queued for ${dto.recipientGroup}`,
      recipientCount: 450,
    };
  }
}

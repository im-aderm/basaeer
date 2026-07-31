import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { PaystackService } from './paystack.service';
import { FinanceService } from './finance.service';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Finance Payments')
@Controller('finance/payments')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class FinancePaymentController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly financeService: FinanceService,
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Initialize Paystack' })
  @Post('paystack/initialize')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  async initializePaystack(
    @Body() body: { invoiceId: string; email: string; amount: number },
    @GetTenantContext() context: TenantContext,
  ) {
    if (!this.paystackService.isConfigured()) {
      return { error: 'Paystack is not configured' };
    }

    const reference = await this.paystackService.generateReference();

    const response = await this.paystackService.initializeTransaction({
      email: body.email,
      amount: body.amount,
      reference,
      metadata: {
        invoiceId: body.invoiceId,
        branchId: context.branchId,
      },
    });

    return {
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
      accessCode: response.data.access_code,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Verify Paystack Payment' })
  @Post('paystack/verify/:reference')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  async verifyPaystackPayment(
    @Param('reference') reference: string,
    @GetTenantContext() context: TenantContext,
  ) {
    if (!this.paystackService.isConfigured()) {
      return { error: 'Paystack is not configured' };
    }

    const verification =
      await this.paystackService.verifyTransaction(reference);

    if (verification.data.status === 'success') {
      const metadata = verification.data.metadata;
      const invoiceId = metadata?.invoiceId;

      if (invoiceId) {
        await this.financeService.recordPayment(
          {
            invoiceId,
            amount: verification.data.amount / 100,
            method: 'PAYSTACK',
            transactionId: reference,
            notes: `Paystack: ${verification.data.channel}`,
          },
          context,
        );
      }
    }

    return {
      verified: verification.data.status === 'success',
      status: verification.data.status,
      reference: verification.data.reference,
      amount: verification.data.amount / 100,
      paidAt: verification.data.paid_at,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Config' })
  @Get('paystack/config')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN)
  async getConfig() {
    return {
      configured: this.paystackService.isConfigured(),
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'not-set',
    };
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { PaystackService } from './paystack.service';
import { FinanceService } from './finance.service';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Finance Payments')
@Controller('finance/payments')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class FinancePaymentController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly financeService: FinanceService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Initialize Paystack' })
  @Post('paystack/initialize')
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
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Paystack Webhook' })
  @Post('paystack/webhook')
  @Public()
  async paystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!this.paystackService.isConfigured()) {
      return { status: 'error', message: 'Paystack not configured' };
    }

    const rawBody = (req as any).rawBody;
    const isValid = this.paystackService.verifyWebhookSignature(
      signature,
      rawBody,
    );

    if (!isValid) {
      return { status: 'error', message: 'Invalid signature' };
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const metadata = event.data?.metadata;
      const invoiceId = metadata?.invoiceId;
      const reference = event.data?.reference;

      if (invoiceId) {
        try {
          const payment = await this.prisma.payment.findFirst({
            where: { transactionId: reference },
          });

          if (!payment) {
            const invoice = await this.prisma.invoice.findFirst({
              where: { id: invoiceId },
            });
            if (invoice) {
              const context: TenantContext = {
                userId: 'webhook',
                branchId: invoice.branchId,
                isSuperAdmin: true,
                role: UserRole.SUPER_ADMIN,
              };

              await this.financeService.recordPayment(
                {
                  invoiceId,
                  amount: event.data.amount / 100,
                  method: 'PAYSTACK',
                  transactionId: reference,
                  notes: 'Webhook: charge.success',
                },
                context,
              );
            }
          }
        } catch (err) {
          return { status: 'error', message: err.message };
        }
      }
    }

    return { status: 'ok', event: event.event };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Config' })
  @Get('paystack/config')
  @Roles(UserRole.SUPER_ADMIN)
  async getConfig() {
    return {
      configured: this.paystackService.isConfigured(),
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'not-set',
    };
  }
}

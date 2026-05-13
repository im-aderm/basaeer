import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from './paystack.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handlePaystackWebhook(signature: string, rawBody: string, parsedPayload: any) {
    if (!this.paystackService.isConfigured()) {
      throw new BadRequestException('Paystack is not configured');
    }

    const isValid = this.paystackService.verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    const { event, data } = parsedPayload;

    await this.prisma.paymentWebhookLog.create({
      data: {
        gateway: 'PAYSTACK',
        event,
        payload: data,
        status: 'PROCESSED',
      },
    });

    if (event === 'charge.success') {
      const invoiceId = data.metadata?.invoiceId;
      if (!invoiceId) {
        this.logger.warn(
          'Payment success webhook received without invoiceId in metadata',
          data,
        );
        return { status: 'ignored' };
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        this.logger.error(
          `Invoice ${invoiceId} not found for successful payment reference ${data.reference}`,
        );
        return { status: 'failed', reason: 'Invoice not found' };
      }

      const existingPayment = await this.prisma.payment.findUnique({
        where: { transactionId: data.reference },
      });

      if (existingPayment) {
        this.logger.log(
          `Payment reference ${data.reference} already processed.`,
        );
        return { status: 'success', message: 'Already processed' };
      }

      const amountPaid = data.amount / 100;

      await this.prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            invoiceId,
            amount: amountPaid,
            method: 'PAYSTACK',
            status: 'COMPLETED',
            transactionId: data.reference,
          },
        });

        const newBalance = Math.max(0, Number(invoice.balance) - amountPaid);
        let newStatus = 'PARTIALLY_PAID';
        if (newBalance === 0) newStatus = 'PAID';
        if (newBalance === Number(invoice.totalAmount)) newStatus = 'UNPAID';

        await tx.invoice.update({
          where: { id: invoiceId },
          data: { balance: newBalance, status: newStatus as any },
        });

        this.eventEmitter.emit('payment.received', {
          branchId: invoice.branchId,
          invoiceId,
          amount: amountPaid,
          reference: data.reference,
        });
      });

      return { status: 'success' };
    }

    return { status: 'ignored' };
  }
}
import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async initializePaystackPayment(
    invoiceId: string,
    email: string,
    amount: number,
  ) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Paystack works in kobo
          metadata: {
            invoiceId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to initialize Paystack payment',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Payment gateway initialization failed');
    }
  }

  async verifyPaystackPayment(reference: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to verify Paystack payment',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Payment verification failed');
    }
  }

  async handlePaystackWebhook(signature: string, payload: any) {
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const { event, data } = payload;

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

      // Ensure idempotency
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
            method: 'BANK_TRANSFER',
            status: 'COMPLETED',
            transactionId: data.reference,
          },
        });

        const newBalance = Math.max(0, invoice.balance - amountPaid);
        let newStatus = 'PARTIALLY_PAID';
        if (newBalance === 0) newStatus = 'PAID';
        if (newBalance === invoice.totalAmount) newStatus = 'UNPAID';

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

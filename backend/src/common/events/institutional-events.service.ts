import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IntegrationsService } from '../../integrations/integrations.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InstitutionalEventsService {
  private readonly logger = new Logger(InstitutionalEventsService.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('payment.received')
  async handlePaymentReceived(payload: {
    branchId: string;
    invoiceId: string;
    amount: number;
    reference: string;
  }) {
    this.logger.log(
      `Event payment.received: invoice ${payload.invoiceId}, amount ${payload.amount}`,
    );

    // 1. Trigger Webhooks
    await this.integrationsService.triggerWebhook(
      payload.branchId,
      'payment.received',
      payload,
    );

    // 2. Cross-module automation: If it's a hostel invoice, update status
    // (This logic would be more complex in production, checking item categories)
  }

  @OnEvent('student.absent')
  async handleStudentAbsent(payload: {
    branchId: string;
    studentId: string;
    date: Date;
  }) {
    this.logger.log(`Event student.absent: student ${payload.studentId}`);

    // Trigger Webhooks
    await this.integrationsService.triggerWebhook(
      payload.branchId,
      'student.absent',
      payload,
    );

    // Send Notification (handled by NotificationsModule in real setup)
  }

  @OnEvent('book.overdue')
  async handleBookOverdue(payload: {
    branchId: string;
    studentId: string;
    bookId: string;
  }) {
    // ...
  }
}

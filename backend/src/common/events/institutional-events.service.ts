import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IntegrationsService } from '../../integrations/integrations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';

@Injectable()
export class InstitutionalEventsService {
  private readonly logger = new Logger(InstitutionalEventsService.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
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

    await this.integrationsService.triggerWebhook(
      payload.branchId,
      'payment.received',
      payload,
    );

    this.realtime.sendToBranch(payload.branchId, 'dashboard.refresh', {
      reason: 'payment.received',
      payload,
    });
  }

  @OnEvent('student.absent')
  async handleStudentAbsent(payload: {
    branchId: string;
    studentId: string;
    date: Date;
  }) {
    this.logger.log(`Event student.absent: student ${payload.studentId}`);

    await this.integrationsService.triggerWebhook(
      payload.branchId,
      'student.absent',
      payload,
    );

    this.realtime.sendToBranch(payload.branchId, 'dashboard.refresh', {
      reason: 'attendance.updated',
    });
  }

  @OnEvent('student.created')
  async handleStudentCreated(payload: {
    branchId: string;
    studentId: string;
    firstName: string;
  }) {
    this.logger.log(`Event student.created: ${payload.firstName}`);
    this.realtime.sendToBranch(payload.branchId, 'dashboard.refresh', {
      reason: 'student.created',
    });
  }

  @OnEvent('staff.created')
  async handleStaffCreated(payload: { branchId: string; staffId: string }) {
    this.realtime.sendToBranch(payload.branchId, 'dashboard.refresh', {
      reason: 'staff.created',
    });
  }

  @OnEvent('attendance.marked')
  async handleAttendanceMarked(payload: { branchId: string }) {
    this.realtime.sendToBranch(payload.branchId, 'dashboard.refresh', {
      reason: 'attendance.marked',
    });
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

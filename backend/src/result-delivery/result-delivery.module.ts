import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ExamsModule } from '../exams/exams.module';
import { ResultDeliveryQueueService } from './result-delivery-queue.service';
import { ResultDeliveryProcessor } from './result-delivery.processor';

/**
 * ResultApprovalService (inside ExamsModule) needs to enqueue delivery jobs
 * on publish, and the delivery processor needs ExamsService to render the
 * PDF — a genuine mutual dependency, resolved with forwardRef() rather than
 * restructuring ExamsModule itself.
 */
@Module({
  imports: [
    PrismaModule,
    UploadModule,
    NotificationsModule,
    forwardRef(() => ExamsModule),
    BullModule.registerQueue({ name: 'result-delivery' }),
  ],
  providers: [ResultDeliveryQueueService, ResultDeliveryProcessor],
  exports: [ResultDeliveryQueueService],
})
export class ResultDeliveryModule {}

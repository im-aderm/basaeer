import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { AutomationWorker } from './workers/automation.worker';
import { AutomationRunnerService } from './automation-runner.service';
import { AutomationHealthController } from './automation-health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommsModule } from '../comms/comms.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    CommsModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'automation' }),
  ],
  controllers: [AutomationController, AutomationHealthController],
  providers: [AutomationService, AutomationWorker, AutomationRunnerService],
  exports: [AutomationService],
})
export class AutomationModule {}

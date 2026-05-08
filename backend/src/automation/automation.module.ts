import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { AutomationWorker } from './workers/automation.worker';
import { AutomationRunnerService } from './automation-runner.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot()
    ],
    controllers: [AutomationController],
    providers: [AutomationService, AutomationWorker, AutomationRunnerService],
    exports: [AutomationService]
})
export class AutomationModule { }

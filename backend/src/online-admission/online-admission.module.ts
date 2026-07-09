import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OnlineAdmissionService } from './online-admission.service';
import { OnlineAdmissionController } from './online-admission.controller';
import { AdmissionSlipService } from './admission-slip.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';
import { AdmissionImportProcessor } from './admission-import.processor';
import { AuditModule } from '../audit/audit.module';
import { CommsModule } from '../comms/comms.module';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    UploadModule,
    AuditModule,
    CommsModule,
    BranchesModule,
    BullModule.registerQueue({ name: 'admission-import' }),
  ],
  controllers: [OnlineAdmissionController],
  providers: [OnlineAdmissionService, AdmissionImportProcessor, AdmissionSlipService],
  exports: [AdmissionSlipService],
})
export class OnlineAdmissionModule {}

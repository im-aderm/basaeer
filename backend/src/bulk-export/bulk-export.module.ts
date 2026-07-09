import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BulkExportController } from './bulk-export.controller';
import { BulkExportService } from './bulk-export.service';
import { BulkExportProcessor } from './bulk-export.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';
import { OnlineAdmissionModule } from '../online-admission/online-admission.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [
    PrismaModule,
    ReportingModule,
    OnlineAdmissionModule,
    CertificatesModule,
    BullModule.registerQueue({ name: 'bulk-exports' }),
  ],
  controllers: [BulkExportController],
  providers: [BulkExportService, BulkExportProcessor],
})
export class BulkExportModule {}

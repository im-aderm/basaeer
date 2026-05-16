import { Module } from '@nestjs/common';
import { AdmissionInterviewService } from './admission-interview.service';
import { AdmissionInterviewController } from './admission-interview.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdmissionInterviewController],
  providers: [AdmissionInterviewService],
  exports: [AdmissionInterviewService],
})
export class AdmissionInterviewModule {}

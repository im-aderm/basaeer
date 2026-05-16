import { Module } from '@nestjs/common';
import { AdmissionExamService } from './admission-exam.service';
import { AdmissionExamController } from './admission-exam.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdmissionExamController],
  providers: [AdmissionExamService],
  exports: [AdmissionExamService],
})
export class AdmissionExamModule {}

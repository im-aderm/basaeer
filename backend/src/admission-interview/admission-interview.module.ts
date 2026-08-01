import { Module } from '@nestjs/common';
import { AdmissionInterviewService } from './admission-interview.service';
import { AdmissionInterviewController } from './admission-interview.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { CommsModule } from '../comms/comms.module';

@Module({
  imports: [PrismaModule, MailModule, CommsModule],
  controllers: [AdmissionInterviewController],
  providers: [AdmissionInterviewService],
  exports: [AdmissionInterviewService],
})
export class AdmissionInterviewModule {}

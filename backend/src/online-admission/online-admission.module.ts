import { Module } from '@nestjs/common';
import { OnlineAdmissionService } from './online-admission.service';
import { OnlineAdmissionController } from './online-admission.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, MailModule, UploadModule],
  controllers: [OnlineAdmissionController],
  providers: [OnlineAdmissionService],
})
export class OnlineAdmissionModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommsController } from './comms.controller';
import { CommsService } from './comms.service';
import { TemplateController } from './template.controller';
import { EmailProcessor } from './email.processor';
import { SmsProcessor } from './sms.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ProvidersModule } from '../providers/providers.module';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ProvidersModule,
    BranchesModule,
    BullModule.registerQueue({ name: 'email' }, { name: 'sms' }),
  ],
  controllers: [CommsController, TemplateController],
  providers: [CommsService, EmailProcessor, SmsProcessor],
  exports: [CommsService],
})
export class CommsModule {}

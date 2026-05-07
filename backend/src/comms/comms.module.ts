import { Module } from '@nestjs/common';
import { CommsController } from './comms.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [CommsController],
})
export class CommsModule {}

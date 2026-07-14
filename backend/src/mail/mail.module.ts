import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { BranchesModule } from '../branches/branches.module';

@Global()
@Module({
  imports: [
    BranchesModule,
    BullModule.registerQueue({ name: 'transactional-email' }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}

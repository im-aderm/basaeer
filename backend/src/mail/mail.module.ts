import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { BranchesModule } from '../branches/branches.module';

@Global()
@Module({
  imports: [BranchesModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

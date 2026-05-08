import { Module, Global } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { SmtpProvider } from './email/smtp.provider';
import { TermiiProvider } from './sms/termii.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    ProvidersService,
    SmtpProvider,
    TermiiProvider,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}

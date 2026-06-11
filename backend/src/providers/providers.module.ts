import { Module, Global } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { SmtpProvider } from './email/smtp.provider';
import { TermiiProvider } from './sms/termii.provider';
import { MetaWhatsAppProvider } from './whatsapp/meta-whatsapp.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ProvidersController],
  providers: [ProvidersService, SmtpProvider, TermiiProvider, MetaWhatsAppProvider],
  exports: [ProvidersService],
})
export class ProvidersModule {}

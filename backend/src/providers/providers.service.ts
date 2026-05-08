import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProviderInterface } from './email/email-provider.interface';
import { SmsProviderInterface } from './sms/sms-provider.interface';
import { SmtpProvider } from './email/smtp.provider';
import { TermiiProvider } from './sms/termii.provider';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);
  private emailProviders: EmailProviderInterface[] = [];
  private smsProviders: SmsProviderInterface[] = [];

  constructor(
    private prisma: PrismaService,
    private smtpProvider: SmtpProvider,
    private termiiProvider: TermiiProvider,
  ) {
    // Primary and secondary providers can be configured here
    this.emailProviders = [this.smtpProvider];
    this.smsProviders = [this.termiiProvider];
  }

  async sendEmailWithFailover(to: string, subject: string, html: string): Promise<boolean> {
    for (let i = 0; i < this.emailProviders.length; i++) {
      const provider = this.emailProviders[i];
      const success = await provider.send(to, subject, html);
      
      if (success) {
        return true;
      }

      // Failover logic
      const nextProvider = this.emailProviders[i + 1];
      if (nextProvider) {
        await this.logFailover(
          provider.constructor.name,
          nextProvider.constructor.name,
          'EMAIL',
          'Primary provider failed'
        );
      }
    }
    return false;
  }

  async sendSmsWithFailover(to: string, message: string): Promise<boolean> {
    for (let i = 0; i < this.smsProviders.length; i++) {
      const provider = this.smsProviders[i];
      const success = await provider.send(to, message);
      
      if (success) {
        return true;
      }

      // Failover logic
      const nextProvider = this.smsProviders[i + 1];
      if (nextProvider) {
        await this.logFailover(
          provider.constructor.name,
          nextProvider.constructor.name,
          'SMS',
          'Primary provider failed'
        );
      }
    }
    return false;
  }

  private async logFailover(failed: string, target: string, type: string, reason: string) {
    this.logger.warn(`Failover occurred: ${failed} -> ${target} (${type})`);
    try {
      await this.prisma.providerFailoverEvent.create({
        data: {
          failedProvider: failed,
          targetProvider: target,
          providerType: type,
          reason: reason,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log failover event: ${error.message}`);
    }
  }
}

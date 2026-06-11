import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProviderInterface } from './email/email-provider.interface';
import { SmsProviderInterface } from './sms/sms-provider.interface';
import { WhatsAppProviderInterface } from './whatsapp/whatsapp-provider.interface';
import { SmtpProvider } from './email/smtp.provider';
import { TermiiProvider } from './sms/termii.provider';
import { MetaWhatsAppProvider } from './whatsapp/meta-whatsapp.provider';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);
  private emailProviders: EmailProviderInterface[] = [];
  private smsProviders: SmsProviderInterface[] = [];
  private whatsAppProviders: WhatsAppProviderInterface[] = [];

  constructor(
    private prisma: PrismaService,
    private smtpProvider: SmtpProvider,
    private termiiProvider: TermiiProvider,
    private metaWhatsAppProvider: MetaWhatsAppProvider,
  ) {
    this.emailProviders = [this.smtpProvider];
    this.smsProviders = [this.termiiProvider];
    this.whatsAppProviders = [this.metaWhatsAppProvider];
  }

  async sendEmailWithFailover(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    const startTime = Date.now();

    for (let i = 0; i < this.emailProviders.length; i++) {
      const provider = this.emailProviders[i];
      const success = await provider.send(to, subject, html);
      const latency = Date.now() - startTime;

      if (success) {
        await this.logProviderHealth(
          'EMAIL',
          provider.constructor.name,
          'UP',
          latency,
        );
        return true;
      }

      await this.logProviderHealth(
        'EMAIL',
        provider.constructor.name,
        'DOWN',
        latency,
        'Send failed',
      );

      const nextProvider = this.emailProviders[i + 1];
      if (nextProvider) {
        await this.logFailover(
          provider.constructor.name,
          nextProvider.constructor.name,
          'EMAIL',
          'Primary provider failed',
        );
      }
    }
    return false;
  }

  async sendSmsWithFailover(to: string, message: string): Promise<boolean> {
    const startTime = Date.now();

    for (let i = 0; i < this.smsProviders.length; i++) {
      const provider = this.smsProviders[i];
      const success = await provider.send(to, message);
      const latency = Date.now() - startTime;

      if (success) {
        await this.logProviderHealth(
          'SMS',
          provider.constructor.name,
          'UP',
          latency,
        );
        return true;
      }

      await this.logProviderHealth(
        'SMS',
        provider.constructor.name,
        'DOWN',
        latency,
        'Send failed',
      );

      const nextProvider = this.smsProviders[i + 1];
      if (nextProvider) {
        await this.logFailover(
          provider.constructor.name,
          nextProvider.constructor.name,
          'SMS',
          'Primary provider failed',
        );
      }
    }
    return false;
  }

  async sendWhatsAppWithFailover(to: string, message: string): Promise<boolean> {
    const startTime = Date.now();

    for (let i = 0; i < this.whatsAppProviders.length; i++) {
      const provider = this.whatsAppProviders[i];
      const success = await provider.send(to, message);
      const latency = Date.now() - startTime;

      if (success) {
        await this.logProviderHealth(
          'WHATSAPP',
          provider.constructor.name,
          'UP',
          latency,
        );
        return true;
      }

      await this.logProviderHealth(
        'WHATSAPP',
        provider.constructor.name,
        'DOWN',
        latency,
        'Send failed',
      );

      const nextProvider = this.whatsAppProviders[i + 1];
      if (nextProvider) {
        await this.logFailover(
          provider.constructor.name,
          nextProvider.constructor.name,
          'WHATSAPP',
          'Primary provider failed',
        );
      }
    }
    return false;
  }

  async getProviderHealth(): Promise<{ email: boolean; sms: boolean; whatsapp: boolean }> {
    const [emailHealth, smsHealth, whatsAppHealth] = await Promise.all([
      this.checkEmailHealth(),
      this.checkSmsHealth(),
      this.checkWhatsAppHealth(),
    ]);
    return { email: emailHealth, sms: smsHealth, whatsapp: whatsAppHealth };
  }

  async getSmsBalance(): Promise<{ provider: string; balance: number }> {
    for (const provider of this.smsProviders) {
      try {
        const balance = await provider.getBalance();
        return { provider: provider.constructor.name, balance };
      } catch {
        continue;
      }
    }
    return { provider: 'unknown', balance: 0 };
  }

  private async checkEmailHealth(): Promise<boolean> {
    for (const provider of this.emailProviders) {
      if (await provider.healthCheck()) return true;
    }
    return false;
  }

  private async checkSmsHealth(): Promise<boolean> {
    for (const provider of this.smsProviders) {
      if (await provider.healthCheck()) return true;
    }
    return false;
  }

  private async checkWhatsAppHealth(): Promise<boolean> {
    for (const provider of this.whatsAppProviders) {
      if (await provider.healthCheck()) return true;
    }
    return false;
  }

  private async logProviderHealth(
    providerType: string,
    providerName: string,
    status: string,
    latency: number,
    error?: string,
  ) {
    try {
      await this.prisma.providerHealthLog.create({
        data: {
          providerType,
          providerName,
          status,
          latency,
          error: error || null,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to log provider health: ${err.message}`);
    }
  }

  private async logFailover(
    failed: string,
    target: string,
    type: string,
    reason: string,
  ) {
    this.logger.warn(`Failover occurred: ${failed} -> ${target} (${type})`);
    try {
      await this.prisma.providerFailoverEvent.create({
        data: {
          failedProvider: failed,
          targetProvider: target,
          providerType: type,
          reason,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log failover event: ${error.message}`);
    }
  }
}

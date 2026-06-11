import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { WhatsAppProviderInterface } from './whatsapp-provider.interface';
import { normalizeNigerianPhone } from '../sms/utils/normalize-phone.util';

@Injectable()
export class MetaWhatsAppProvider implements WhatsAppProviderInterface {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly apiVersion = 'v22.0';

  private get baseUrl(): string {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    if (!phoneNumberId) return '';
    return `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}/messages`;
  }

  private get token(): string {
    return process.env.META_WHATSAPP_ACCESS_TOKEN || '';
  }

  async send(to: string, message: string): Promise<boolean> {
    const normalizedTo = normalizeNigerianPhone(to);
    const url = this.baseUrl;
    const token = this.token;

    if (!url || !token) {
      this.logger.error('WhatsApp not configured: missing META_WHATSAPP_PHONE_NUMBER_ID or META_WHATSAPP_ACCESS_TOKEN');
      return false;
    }

    try {
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTo,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data && response.data.messages?.[0]?.id) {
        this.logger.log(`WhatsApp sent to ${normalizedTo} | MessageId: ${response.data.messages[0].id}`);
        return true;
      }

      this.logger.warn(`WhatsApp send failed: ${JSON.stringify(response.data)}`);
      return false;
    } catch (error) {
      const detail = error.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to send WhatsApp to ${normalizedTo}: ${detail}`);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    const url = this.baseUrl;
    const token = this.token;
    if (!url || !token) return false;

    try {
      // Use a lightweight account lookup to verify credentials
      const response = await axios.get(url.replace(/\/messages$/, ''), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

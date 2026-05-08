import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SmsProviderInterface } from './sms-provider.interface';
import { normalizeNigerianPhone } from './utils/normalize-phone.util';

@Injectable()
export class TermiiProvider implements SmsProviderInterface {
  private readonly logger = new Logger(TermiiProvider.name);
  private readonly baseUrl = 'https://api.ng.termii.com/api';

  async send(to: string, message: string): Promise<boolean> {
    const normalizedTo = normalizeNigerianPhone(to);
    try {
      const response = await axios.post(`${this.baseUrl}/sms/send`, {
        api_key: process.env.TERMII_API_KEY,
        to: normalizedTo,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
      });

      if (response.data && response.data.message === 'Successfully Sent') {
        return true;
      }
      this.logger.warn(`Termii send failed: ${JSON.stringify(response.data)}`);
      return false;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${normalizedTo}: ${error.message}`);
      return false;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-balance`, {
        params: {
          api_key: process.env.TERMII_API_KEY,
        },
      });
      return response.data.balance || 0;
    } catch (error) {
      this.logger.error(`Failed to get Termii balance: ${error.message}`);
      return 0;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simplest way to check health is to try getting balance
      const balance = await this.getBalance();
      return balance >= 0;
    } catch (error) {
      return false;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    currency: string;
    metadata: any;
    authorization: {
      authorization_code: string;
      card_type: string;
      last4: string;
      bank: string;
    };
  };
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      this.logger.warn(
        'PAYSTACK_SECRET_KEY not set. Payment gateway is inactive.',
      );
    }
  }

  isConfigured(): boolean {
    return !!this.secretKey;
  }

  async initializeTransaction(params: {
    email: string;
    amount: number; // in Naira (kobo conversion handled internally)
    reference?: string;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<PaystackInitializeResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured');
    }

    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: params.email,
        amount: params.amount * 100, // Convert Naira to Kobo
        reference: params.reference,
        currency: params.currency || 'NGN',
        metadata: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured');
    }

    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      },
    );

    return response.data;
  }

  async generateReference(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BSR-${timestamp}-${random}`.toUpperCase();
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!this.secretKey) return false;
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // API Key Management
  async createApiKey(branchId: string, name: string, scopes: string[]) {
    const rawKey = `bs_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await this.prisma.apiKey.create({
      data: {
        name,
        hashedKey,
        scopes,
        branchId,
      },
    });

    return { key: rawKey };
  }

  async validateApiKey(key: string) {
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { hashedKey },
      include: { branch: true },
    });

    if (!apiKey) throw new UnauthorizedException('Invalid API key');
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  }

  async deleteApiKey(id: string, branchId: string) {
    return this.prisma.apiKey.deleteMany({
      where: { id, branchId },
    });
  }

  async listApiKeys(branchId: string) {
    return this.prisma.apiKey.findMany({
      where: { branchId },
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  // Webhook Management
  async registerWebhook(branchId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(32).toString('hex');
    return this.prisma.webhookEndpoint.create({
      data: {
        url,
        events,
        secret,
        branchId,
      },
    });
  }

  async listWebhooks(branchId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { branchId },
    });
  }

  async deleteWebhook(id: string, branchId: string) {
    return this.prisma.webhookEndpoint.deleteMany({
      where: { id, branchId },
    });
  }

  // Outbound Webhook Delivery (to be called by event emitters)
  async triggerWebhook(branchId: string, event: string, payload: any) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { branchId, events: { has: event }, isActive: true },
    });

    for (const endpoint of endpoints) {
      const deliveryLog = await this.prisma.webhookDeliveryLog.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload,
          status: 'PENDING',
        },
      });

      // Fire and forget (or could be moved to BullMQ)
      this.deliverWebhook(endpoint, deliveryLog, payload);
    }
  }

  private async deliverWebhook(endpoint: any, log: any, payload: any) {
    const signature = crypto
      .createHmac('sha256', endpoint.secret || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await axios.post(endpoint.url, payload, {
        headers: {
          'X-Basaeer-Event': log.event,
          'X-Basaeer-Signature': signature,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      await this.prisma.webhookDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: 'SUCCESS',
          statusCode: response.status,
          response: JSON.stringify(response.data),
          attempts: 1,
        },
      });
    } catch (error) {
      await this.prisma.webhookDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          statusCode: error.response?.status,
          response: error.message,
          attempts: 1,
        },
      });
    }
  }
}

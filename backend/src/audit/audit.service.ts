import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';

export interface AuditLogParams {
  action: string;
  module: string;
  context: TenantContext;
  targetId?: string;
  targetType?: string;
  details?: any;
  reason?: string;
  beforeState?: any;
  afterState?: any;
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private request?: Request,
  ) {}

  private getIpAddress(): string | undefined {
    if (!this.request) return undefined;
    const forwarded = this.request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return this.request.ip || this.request.socket?.remoteAddress || undefined;
  }

  async log(params: AuditLogParams) {
    const {
      action,
      module,
      context,
      targetId,
      targetType,
      details,
      reason,
      beforeState,
      afterState,
    } = params;

    return this.prisma.auditLog.create({
      data: {
        action,
        module,
        userId: context.userId,
        branchId: context.branchId || undefined,
        ipAddress: this.getIpAddress(),
        targetId: targetId || undefined,
        targetType: targetType || undefined,
        details: details
          ? typeof details === 'string'
            ? details
            : JSON.stringify(details)
          : undefined,
        reason: reason || undefined,
        beforeState: beforeState || undefined,
        afterState: afterState || undefined,
      },
    });
  }

  async logAction(
    userId: string,
    action: string,
    module: string,
    branchId?: string,
    details?: any,
    reason?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        module,
        userId,
        branchId: branchId || undefined,
        ipAddress: this.getIpAddress(),
        details: details
          ? typeof details === 'string'
            ? details
            : JSON.stringify(details)
          : undefined,
        reason: reason || undefined,
      },
    });
  }

  async getLogs(query: {
    userId?: string;
    module?: string;
    action?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      module,
      action,
      branchId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (action) where.action = action;
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}

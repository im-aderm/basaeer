import { Injectable } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

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
    cursor?: string;
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
      cursor,
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

    // Cursor-based pagination (8.6)
    if (cursor) {
      const items = await this.prisma.auditLog.findMany({
        where,
        take: Number(limit),
        skip: 1,
        cursor: { id: cursor },
        orderBy: { id: 'asc' },
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
      });

      const lastItem = items[items.length - 1];

      return {
        items,
        total: null,
        page: null,
        limit: Number(limit),
        totalPages: null,
        nextCursor: lastItem?.id || null,
        hasMore: items.length === Number(limit),
      };
    }

    // Fallback to offset-based pagination
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

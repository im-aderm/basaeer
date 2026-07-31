import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { AutomationService } from './automation.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Automation Health')
@Controller('automation/health')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
export class AutomationHealthController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Executions' })
  @Get('executions')
  async getExecutions(
    @GetTenantContext() tenantContext: TenantContext,
    @Query('limit') limit?: string,
  ) {
    return this.automationService.getExecutions(
      tenantContext,
      parseInt(limit || '50', 10),
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  async getStats(@GetTenantContext() tenantContext: TenantContext) {
    return this.automationService.getExecutionStats(tenantContext);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Queue Health' })
  @Get('queue-health')
  async getQueueHealth(@GetTenantContext() tenantContext: TenantContext) {
    const branchId = tenantContext.isSuperAdmin
      ? undefined
      : tenantContext.branchId;
    const where = branchId ? { branchId } : {};

    const recentMetrics = await this.prisma.queueMetric.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentFailovers = await this.prisma.providerFailoverEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const providerHealth = await this.prisma.providerHealthLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      metrics: recentMetrics,
      recentFailovers,
      providerHealth,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Delivery Stats' })
  @Get('delivery-stats')
  async getDeliveryStats(@GetTenantContext() tenantContext: TenantContext) {
    const branchId = tenantContext.isSuperAdmin
      ? undefined
      : tenantContext.branchId;
    const where = branchId ? { branchId } : {};

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalDelivered, totalFailed, recentDeliveryLogs] = await Promise.all(
      [
        this.prisma.messageDeliveryLog.count({
          where: { ...where, status: 'DELIVERED' },
        }),
        this.prisma.messageDeliveryLog.count({
          where: { ...where, status: 'FAILED' },
        }),
        this.prisma.messageDeliveryLog.findMany({
          where: { ...where, createdAt: { gte: last24h } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ],
    );

    return { totalDelivered, totalFailed, recentDeliveryLogs };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Retry Stats' })
  @Get('retry-stats')
  async getRetryStats(@GetTenantContext() tenantContext: TenantContext) {
    const branchId = tenantContext.isSuperAdmin
      ? undefined
      : tenantContext.branchId;
    const where = branchId ? { branchId } : {};

    const retries = await this.prisma.messageRetryEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const pendingRetries = await this.prisma.messageRetryEvent.count({
      where: { ...where, status: 'PENDING' },
    });

    return { pendingRetries, recentRetries: retries };
  }
}

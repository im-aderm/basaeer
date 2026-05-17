import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { BranchDashboardService } from './branch-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AnalyticsController],
  providers: [ExecutiveDashboardService, BranchDashboardService, PrismaService],
  exports: [ExecutiveDashboardService, BranchDashboardService],
})
export class AnalyticsModule {}

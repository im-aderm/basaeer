import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { BranchBrandingService } from './branch-branding.service';
import { BranchBrandingController } from './branch-branding.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BranchesController, BranchBrandingController],
  providers: [BranchesService, BranchBrandingService],
  exports: [BranchBrandingService],
})
export class BranchesModule {}

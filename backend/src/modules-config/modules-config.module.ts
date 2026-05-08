import { Module } from '@nestjs/common';
import { ModulesConfigService } from './modules-config.service';
import { ModulesConfigController } from './modules-config.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesConfigController],
  providers: [ModulesConfigService],
  exports: [ModulesConfigService],
})
export class ModulesConfigModule {}

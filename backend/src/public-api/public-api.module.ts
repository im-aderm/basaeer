import { Module } from '@nestjs/common';
import { PublicApiController } from './public-api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [PublicApiController],
})
export class PublicApiModule {}

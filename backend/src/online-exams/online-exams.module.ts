import { Module } from '@nestjs/common';
import { OnlineExamsService } from './online-exams.service';
import { OnlineExamsController } from './online-exams.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnlineExamsController],
  providers: [OnlineExamsService],
})
export class OnlineExamsModule {}

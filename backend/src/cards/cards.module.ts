import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
    imports: [PrismaModule, AttendanceModule],
    controllers: [CardsController],
    providers: [CardsService],
})
export class CardsModule { }

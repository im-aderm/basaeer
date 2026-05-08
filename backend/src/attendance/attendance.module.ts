import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QRService } from './qr.service';
import { AttendanceSessionService } from './attendance-session.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { CommsModule } from '../comms/comms.module';

@Module({
    imports: [PrismaModule, RealtimeModule, CommsModule],
    controllers: [AttendanceController],
    providers: [AttendanceService, QRService, AttendanceSessionService],
    exports: [AttendanceService, QRService, AttendanceSessionService]
})
export class AttendanceModule { }


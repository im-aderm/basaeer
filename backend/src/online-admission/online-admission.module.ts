import { Module } from '@nestjs/common';
import { OnlineAdmissionService } from './online-admission.service';
import { OnlineAdmissionController } from './online-admission.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [OnlineAdmissionController],
    providers: [OnlineAdmissionService],
})
export class OnlineAdmissionModule { }

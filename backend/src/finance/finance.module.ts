import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FinanceController, PaymentsController],
    providers: [FinanceService, PaymentsService],
    exports: [FinanceService, PaymentsService],
})
export class FinanceModule { }

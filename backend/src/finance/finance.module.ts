import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { FinancePaymentController } from './finance-payment.controller';
import { PaystackService } from './paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, RealtimeModule, AuthModule],
    controllers: [FinanceController, PaymentsController, FinancePaymentController],
    providers: [FinanceService, PaymentsService, PaystackService],
    exports: [FinanceService, PaymentsService, PaystackService],
})
export class FinanceModule { }

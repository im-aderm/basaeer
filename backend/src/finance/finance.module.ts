import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { FinancePaymentController } from './finance-payment.controller';
import { GeneralLedgerController } from './general-ledger.controller';
import { PaystackService } from './paystack.service';
import { GeneralLedgerService } from './general-ledger.service';
import { TaxEngineService } from './tax-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, RealtimeModule, AuditModule, AuthModule],
  controllers: [
    FinanceController,
    PaymentsController,
    FinancePaymentController,
    GeneralLedgerController,
  ],
  providers: [FinanceService, PaymentsService, PaystackService, GeneralLedgerService, TaxEngineService],
  exports: [FinanceService, PaymentsService, PaystackService, GeneralLedgerService, TaxEngineService],
})
export class FinanceModule {}

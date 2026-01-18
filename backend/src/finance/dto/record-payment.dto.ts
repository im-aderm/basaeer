import { PaymentMethod } from '../../generated/client/client';

export class RecordPaymentDto {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    proofUrl?: string;
    notes?: string;
    branchId?: string;
}

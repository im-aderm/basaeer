import { OnlineAdmissionService } from './online-admission.service';
import { TenantContext } from '../auth/branch.guard';

/**
 * Covers the opt-in admission/registration-fee invoice generation that runs
 * after a student is enrolled. The invoice then flows through the normal
 * finance (and therefore discount) path.
 */
describe('OnlineAdmissionService.createAdmissionFeeInvoice', () => {
  const ctx: TenantContext = {
    userId: 'u1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: 'BRANCH_ADMIN' as any,
  };

  const build = (settings: { key: string; value: string; branchId: string | null }[], category: any = null) => {
    const prisma: any = {
      globalSetting: { findMany: jest.fn().mockResolvedValue(settings) },
      feeCategory: {
        findFirst: jest.fn().mockResolvedValue(category),
        create: jest.fn().mockResolvedValue({ id: 'cat-new' }),
      },
    };
    const financeService: any = { createInvoice: jest.fn().mockResolvedValue({ id: 'inv-1' }) };
    const service = new OnlineAdmissionService(
      prisma,
      {} as any, // mail
      {} as any, // comms
      {} as any, // audit
      financeService,
    );
    return { service, prisma, financeService };
  };

  const run = (service: OnlineAdmissionService) =>
    (service as any).createAdmissionFeeInvoice('student-1', 'branch-1', ctx);

  it('does nothing when the opt-in setting is not enabled', async () => {
    const { service, financeService } = build([
      { key: 'admission_fee', value: '5000', branchId: 'branch-1' },
    ]);
    await run(service);
    expect(financeService.createInvoice).not.toHaveBeenCalled();
  });

  it('raises an invoice for the fee when opted in', async () => {
    const { service, financeService } = build([
      { key: 'admission_generate_fee_invoice', value: 'true', branchId: null },
      { key: 'admission_fee', value: '5000', branchId: 'branch-1' },
    ], { id: 'cat-existing' });

    await run(service);

    expect(financeService.createInvoice).toHaveBeenCalledTimes(1);
    const [dto] = financeService.createInvoice.mock.calls[0];
    expect(dto.studentId).toBe('student-1');
    expect(dto.branchId).toBe('branch-1');
    expect(dto.items).toEqual([{ categoryId: 'cat-existing', amount: 5000 }]);
  });

  it('creates the Admission Fee category when missing', async () => {
    const { service, prisma, financeService } = build([
      { key: 'admission_generate_fee_invoice', value: 'true', branchId: 'branch-1' },
      { key: 'admission_fee', value: '3000', branchId: 'branch-1' },
    ], null);

    await run(service);

    expect(prisma.feeCategory.create).toHaveBeenCalled();
    expect(financeService.createInvoice.mock.calls[0][0].items[0].categoryId).toBe('cat-new');
  });

  it('skips when opted in but the fee is zero/unset', async () => {
    const { service, financeService } = build([
      { key: 'admission_generate_fee_invoice', value: 'true', branchId: 'branch-1' },
      { key: 'admission_fee', value: '0', branchId: 'branch-1' },
    ]);
    await run(service);
    expect(financeService.createInvoice).not.toHaveBeenCalled();
  });

  it('never throws (billing failure must not block enrolment)', async () => {
    const { service, financeService } = build([
      { key: 'admission_generate_fee_invoice', value: 'true', branchId: 'branch-1' },
      { key: 'admission_fee', value: '5000', branchId: 'branch-1' },
    ], { id: 'cat-existing' });
    financeService.createInvoice.mockRejectedValue(new Error('GL down'));
    await expect(run(service)).resolves.toBeUndefined();
  });
});

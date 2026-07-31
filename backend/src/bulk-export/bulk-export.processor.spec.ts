import { BulkExportProcessor } from './bulk-export.processor';

describe('BulkExportProcessor', () => {
  const makeDeps = () => {
    const updates: any[] = [];
    const prisma = {
      academicExport: {
        update: jest.fn((args: any) => {
          updates.push(args.data);
          return Promise.resolve({});
        }),
      },
      onlineAdmission: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'a1', admissionNumber: 'ADM-1', firstName: 'A', lastName: 'B' },
          { id: 'a2', admissionNumber: 'ADM-2', firstName: 'C', lastName: 'D' },
        ]),
      },
      runInTenantContext: jest.fn((_branchId: any, _sessionId: any, _userId: any, fn: () => any) => fn()),
    } as any;

    let savedBuffer: Buffer | null = null;
    const reporting = {
      saveExportBuffer: jest.fn((buffer: Buffer) => {
        savedBuffer = buffer;
        return Promise.resolve({ fileUrl: '/exports/x.zip', fileSize: buffer.length });
      }),
    } as any;

    const admissionSlip = {
      generateSlip: jest.fn((id: string) =>
        Promise.resolve({ buffer: Buffer.from(`%PDF-1.4 ${id}`), filename: `slip-${id}.pdf` }),
      ),
    } as any;

    const certificates = { generatePDF: jest.fn() } as any;

    const processor = new BulkExportProcessor(
      prisma,
      reporting,
      admissionSlip,
      certificates,
    );
    return { processor, prisma, reporting, admissionSlip, updates, getSaved: () => savedBuffer };
  };

  it('zips one PDF per admission and marks the export COMPLETED', async () => {
    const { processor, reporting, admissionSlip, updates, getSaved } = makeDeps();

    const result = await processor.process({
      data: {
        exportId: 'exp-1',
        type: 'ADMISSION_SLIP',
        filters: {},
        userId: 'u1',
        branchId: 'branch-1',
      },
    } as any);

    expect(admissionSlip.generateSlip).toHaveBeenCalledTimes(2);
    expect(reporting.saveExportBuffer).toHaveBeenCalledTimes(1);

    // Output is a real ZIP (PK magic bytes).
    const zip = getSaved()!;
    expect(zip.subarray(0, 2).toString('latin1')).toBe('PK');

    expect(result.count).toBe(2);
    const final = updates[updates.length - 1];
    expect(final.status).toBe('COMPLETED');
    expect(final.fileUrl).toBe('/exports/x.zip');
  });

  it('marks the export FAILED when nothing matches the selection', async () => {
    const { processor, prisma, updates } = makeDeps();
    prisma.onlineAdmission.findMany.mockResolvedValue([]);

    await expect(
      processor.process({
        data: { exportId: 'exp-2', type: 'ADMISSION_SLIP', filters: {}, userId: 'u1', branchId: 'branch-1' },
      } as any),
    ).rejects.toThrow(/No documents matched/);

    expect(updates[updates.length - 1].status).toBe('FAILED');
  });
});

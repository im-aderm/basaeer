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
      generateExcel: jest.fn(async () => Buffer.from('XLSX')),
      generateCsvBuffer: jest.fn(async () => Buffer.from('CSV')),
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

  it('produces a single Excel file with a row per admission and completes', async () => {
    const { processor, prisma, reporting, updates, getSaved } = makeDeps();
    prisma.onlineAdmission.findMany.mockResolvedValue([
      { id: 'a1', admissionNumber: 'ADM-1', firstName: 'A', lastName: 'B', gender: 'Male', dateOfBirth: new Date('2015-01-01'), status: 'PENDING', guardianName: 'G1', guardianPhone: '111', createdAt: new Date('2025-01-01'), desiredClass: { name: 'JSS1' }, desiredSection: { name: 'A' }, academicSession: { name: '2024/2025' } },
    ]);

    const result = await processor.process({
      data: {
        exportId: 'exp-3',
        type: 'ADMISSION_LIST_EXCEL',
        filters: { status: 'PENDING', search: 'A' },
        userId: 'u1',
        branchId: 'branch-1',
      },
    } as any);

    expect(reporting.generateExcel).toHaveBeenCalledTimes(1);
    expect(reporting.generateExcel).toHaveBeenCalledWith(
      expect.arrayContaining(['Admission No', 'Guardian Phone', 'Status']),
      expect.arrayContaining([expect.arrayContaining(['ADM-1', 'A', 'B'])]),
      'Admissions',
    );
    expect(reporting.saveExportBuffer).toHaveBeenCalledTimes(1);
    const final = updates[updates.length - 1];
    expect(final.status).toBe('COMPLETED');
    expect(final.fileName).toMatch(/\.xlsx$/);
    expect(result.count).toBe(1);
    expect(getSaved()).not.toBeNull();
  });

  it('produces a CSV file for ADMISSION_LIST_CSV', async () => {
    const { processor, reporting, updates } = makeDeps();

    const result = await processor.process({
      data: {
        exportId: 'exp-4',
        type: 'ADMISSION_LIST_CSV',
        filters: {},
        userId: 'u1',
        branchId: 'branch-1',
      },
    } as any);

    expect(reporting.generateCsvBuffer).toHaveBeenCalledTimes(1);
    const final = updates[updates.length - 1];
    expect(final.status).toBe('COMPLETED');
    expect(final.fileName).toMatch(/\.csv$/);
    expect(result.count).toBe(2);
  });
});

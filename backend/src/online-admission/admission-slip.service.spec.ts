import { Test } from '@nestjs/testing';
import { PDFDocument as PdfLibDocument } from 'pdf-lib';
import { AdmissionSlipService } from './admission-slip.service';
import { PrismaService } from '../prisma/prisma.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { NotFoundException } from '@nestjs/common';
import { TenantContext } from '../auth/branch.guard';

// 1x1 PNG (transparent) used as a stand-in for passport/document images.
const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const ctx: TenantContext = {
  userId: 'u1',
  branchId: 'branch-1',
  isSuperAdmin: false,
  role: 'BRANCH_ADMIN' as any,
};

describe('AdmissionSlipService', () => {
  let service: AdmissionSlipService;
  let pdfDataUrl: string;

  const findFirst = jest.fn();

  beforeAll(async () => {
    // A minimal valid PDF to stand in for a submitted PDF document.
    const pdf = await PdfLibDocument.create();
    pdf.addPage([200, 200]);
    pdfDataUrl =
      'data:application/pdf;base64,' +
      Buffer.from(await pdf.save()).toString('base64');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdmissionSlipService,
        { provide: PrismaService, useValue: { onlineAdmission: { findFirst } } },
        {
          provide: BranchBrandingService,
          useValue: {
            getBranding: jest.fn().mockResolvedValue({
              name: 'Test School',
              logoUrl: null,
              primaryColor: '#2563EB',
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AdmissionSlipService);
  });

  beforeEach(() => findFirst.mockReset());

  it('throws NotFound when the admission does not exist', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.generateSlip('missing', ctx)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('produces a valid PDF: cover + one page per document', async () => {
    findFirst.mockResolvedValue({
      id: 'adm-1',
      branchId: 'branch-1',
      admissionNumber: 'ADM-001',
      firstName: 'Amina',
      lastName: 'Yusuf',
      gender: 'Female',
      dateOfBirth: new Date('2015-04-10'),
      status: 'APPLICATION_RECEIVED',
      guardianName: 'Yusuf Bello',
      guardianPhone: '08000000000',
      createdAt: new Date('2026-05-01'),
      passportPhoto: PNG_DATA_URL, // -> cover, right side
      birthCertificateUrl: PNG_DATA_URL, // image document -> its own page
      schoolReportUrl: pdfDataUrl, // pdf document -> appended
      desiredClass: { name: 'JSS 1' },
      offeredClass: null,
      academicSession: { name: '2026/2027' },
      branch: { name: 'Test School' },
    });

    const { buffer, filename } = await service.generateSlip('adm-1', ctx);

    expect(filename).toBe('admission-slip-ADM-001.pdf');
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');

    // cover (1) + birth certificate image (1) + school report PDF (1) = 3 pages
    const out = await PdfLibDocument.load(buffer);
    expect(out.getPageCount()).toBe(3);
  });

  it('still generates a slip when there are no documents', async () => {
    findFirst.mockResolvedValue({
      id: 'adm-2',
      branchId: 'branch-1',
      admissionNumber: 'ADM-002',
      firstName: 'Sadiq',
      lastName: 'Umar',
      gender: 'Male',
      dateOfBirth: new Date('2016-01-01'),
      status: 'APPLICATION_RECEIVED',
      guardianName: 'Umar Sani',
      guardianPhone: '08111111111',
      createdAt: new Date('2026-05-02'),
      passportPhoto: null,
      desiredClass: { name: 'Primary 1' },
      academicSession: { name: '2026/2027' },
      branch: { name: 'Test School' },
    });

    const { buffer } = await service.generateSlip('adm-2', ctx);
    const out = await PdfLibDocument.load(buffer);
    expect(out.getPageCount()).toBe(1);
  });
});

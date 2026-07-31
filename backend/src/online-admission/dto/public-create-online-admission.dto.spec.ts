import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PublicCreateOnlineAdmissionDto } from './public-create-online-admission.dto';

/**
 * Regression test for the mass-assignment finding on the public admission
 * endpoint: an anonymous submitter could set paymentStatus/parentId/
 * admissionNumber/approvedByStaffId/studentStatus directly, bypassing the
 * entire review/payment step. This DTO is what the global
 * ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }) in
 * main.ts validates the public POST /online-admissions body against, so
 * simulating that same pipe behavior here proves the fix without booting
 * the full app.
 */
describe('PublicCreateOnlineAdmissionDto', () => {
  const validBody = {
    firstName: 'Amina',
    lastName: 'Yusuf',
    gender: 'Female',
    dateOfBirth: '2015-01-01',
    guardianName: 'Yusuf Bello',
    guardianPhone: '+2348012345678',
    guardianEmail: 'guardian@example.com',
    branchId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  };

  const privilegedFields = [
    'paymentStatus',
    'parentId',
    'admissionNumber',
    'approvedByStaffId',
    'studentStatus',
    'createdByStaffId',
    'approvalDate',
  ];

  it.each(privilegedFields)(
    'rejects a payload that tries to set %s (forbidNonWhitelisted)',
    async (field) => {
      const instance = plainToInstance(PublicCreateOnlineAdmissionDto, {
        ...validBody,
        [field]: field === 'paymentStatus' ? 'VERIFIED' : 'some-value',
      });

      const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.constraints?.whitelistValidation?.includes(field)),
      ).toBe(true);
    },
  );

  it('accepts a legitimate applicant payload with no privileged fields', async () => {
    const instance = plainToInstance(PublicCreateOnlineAdmissionDto, validBody);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors).toEqual([]);
  });
});

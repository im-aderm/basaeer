import { OmitType } from '@nestjs/mapped-types';
import { CreateOnlineAdmissionDto } from './create-online-admission.dto';

/**
 * DTO for the unauthenticated, public admission-application endpoint.
 *
 * Omits every field an anonymous caller must never control: fields that
 * bypass staff review/payment verification (paymentStatus, studentStatus,
 * approvedByStaffId, approvalDate), attribute the submission to a staff
 * member (createdByStaffId), or attach the application to an arbitrary
 * existing account (parentId), plus the system-generated admissionNumber.
 * Global ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
 * (main.ts) rejects the request outright if any of these are sent, rather
 * than silently dropping them.
 *
 * CreateOnlineAdmissionDto itself remains the DTO for internal/staff-created
 * admissions (e.g. `import`), where these fields are legitimate.
 */
export class PublicCreateOnlineAdmissionDto extends OmitType(
  CreateOnlineAdmissionDto,
  [
    'admissionNumber',
    'createdByStaffId',
    'approvalDate',
    'approvedByStaffId',
    'studentStatus',
    'paymentStatus',
    'parentId',
  ] as const,
) {}

import { AttendanceStatus } from '../../generated/client/client';

export class CreateAttendanceDto {
  date: string; // ISO Date string
  status: AttendanceStatus;
  remarks?: string;
  studentId: string;
  sectionId?: string;
  sessionId?: string;
}

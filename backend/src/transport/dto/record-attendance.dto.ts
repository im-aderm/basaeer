import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RecordTransportAttendanceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsIn(['PICKUP', 'DROPOFF'])
  type: string;

  @IsIn(['PRESENT', 'ABSENT'])
  status: string;

  @IsDateString()
  date: string;
}

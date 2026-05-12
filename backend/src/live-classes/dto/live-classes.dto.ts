import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsISO8601,
} from 'class-validator';

export class CreateGoogleMeetConfigDto {
  branchId: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  scopes?: string;

  @IsOptional()
  @IsString()
  serviceAccountJson?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsInt()
  defaultDuration?: number;

  @IsOptional()
  @IsBoolean()
  allowRecording?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

export class UpdateGoogleMeetConfigDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  scopes?: string;

  @IsOptional()
  @IsString()
  serviceAccountJson?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsInt()
  defaultDuration?: number;

  @IsOptional()
  @IsBoolean()
  allowRecording?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsISO8601()
  scheduledStart: string;

  @IsOptional()
  @IsISO8601()
  scheduledEnd?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO8601()
  scheduledStart?: string;

  @IsOptional()
  @IsISO8601()
  scheduledEnd?: string;

  @IsOptional()
  @IsEnum(['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @IsOptional()
  @IsString()
  recordingStatus?: string;
}

export class RecordParticipantDto {
  @IsString()
  userId: string;

  @IsEnum(['join', 'leave'])
  action: 'join' | 'leave';
}

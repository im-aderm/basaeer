export class CreateGoogleMeetConfigDto {
    branchId: string;
    serviceAccountJson: string;
    projectId: string;
    clientId: string;
    clientSecret: string;
    apiKey: string;
    isEnabled?: boolean;
    defaultDuration?: number;
    allowRecording?: boolean;
    requireApproval?: boolean;
}

export class UpdateGoogleMeetConfigDto {
    serviceAccountJson?: string;
    projectId?: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    isEnabled?: boolean;
    defaultDuration?: number;
    allowRecording?: boolean;
    requireApproval?: boolean;
}

export class CreateSessionDto {
    title: string;
    description?: string;
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    scheduledStart: string; // ISO date string
    scheduledEnd?: string; // ISO date string, optional (will use defaultDuration if not provided)
}

export class UpdateSessionDto {
    title?: string;
    description?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    status?: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
}

export class RecordParticipantDto {
    userId: string;
    action: 'join' | 'leave';
}

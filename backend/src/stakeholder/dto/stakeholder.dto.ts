import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';

// Parent Portal DTOs
export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class CreateConversationDto {
    @IsString()
    @IsNotEmpty()
    recipientId: string; // Teacher or Staff ID

    @IsOptional()
    @IsString()
    title?: string;
}

// Alumni Module DTOs
export class CreateAlumniDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsDateString()
    @IsNotEmpty()
    graduationDate: string;

    @IsOptional()
    @IsString()
    currentOccupation?: string;

    @IsOptional()
    @IsString()
    currentCompany?: string;

    @IsOptional()
    @IsString()
    higherEducation?: string;

    @IsOptional()
    @IsString()
    linkedInUrl?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

export class CreateAlumniEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;

    @IsOptional()
    @IsString()
    meetingUrl?: string;
}

export class UpdateAlumniEventParticipationDto {
    @IsString()
    @IsNotEmpty()
    status: 'INTERESTED' | 'GOING' | 'DECLINED';
}

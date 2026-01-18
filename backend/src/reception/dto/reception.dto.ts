import { IsString, IsOptional, IsEmail, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateEnquiryDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    nextFollowUpDate?: string;

    @IsOptional()
    @IsString()
    source?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsString()
    branchId: string;
}

export class CreateCallLogDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    nextFollowUpDate?: string;

    @IsString()
    callType: string; // INCOMING, OUTGOING

    @IsString()
    branchId: string;
}

export class CreateVisitorLogDto {
    @IsString()
    purpose: string;

    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    idCard?: string;

    @IsOptional()
    @IsNumber()
    numPerson?: number;

    @IsOptional()
    @IsString()
    inTime?: string;

    @IsOptional()
    @IsString()
    outTime?: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsString()
    branchId: string;
}

export class CreateComplaintDto {
    @IsString()
    complaintType: string;

    @IsOptional()
    @IsString()
    source?: string;

    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    actionTaken?: string;

    @IsOptional()
    @IsString()
    assignedTo?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsString()
    branchId: string;
}

export class CreatePostalRecordDto {
    @IsString()
    fromTitle: string;

    @IsString()
    toTitle: string;

    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    type: string; // DISPATCH, RECEIVE

    @IsString()
    branchId: string;
}

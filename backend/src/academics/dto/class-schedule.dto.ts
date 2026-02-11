import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateClassScheduleDto {
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
    startTime: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
    endTime: string;

    @IsOptional()
    @IsString()
    room?: string;

    @IsString()
    @IsNotEmpty()
    classId: string;

    @IsString()
    @IsNotEmpty()
    sectionId: string;

    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @IsString()
    @IsNotEmpty()
    teacherId: string;
}

export class UpdateClassScheduleDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek?: number;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
    endTime?: string;

    @IsOptional()
    @IsString()
    room?: string;

    @IsOptional()
    @IsString()
    subjectId?: string;

    @IsOptional()
    @IsString()
    teacherId?: string;
}

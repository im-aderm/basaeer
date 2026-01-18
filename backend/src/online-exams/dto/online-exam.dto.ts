import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, ExamStatus } from '../../generated/client/client';

export class CreateQuestionGroupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;
}

export class CreateQuestionOptionDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    @IsOptional()
    isCorrect?: boolean;
}

export class CreateQuestionDto {
    @IsEnum(QuestionType)
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    marks?: number;

    @IsUUID()
    @IsNotEmpty()
    groupId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionOptionDto)
    @IsOptional()
    options?: CreateQuestionOptionDto[];
}

export class CreateOnlineExamDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    scheduledDate: string;

    @IsNumber()
    @Min(1)
    durationMinutes: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    passPercentage?: number;

    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;

    @IsUUID()
    @IsNotEmpty()
    classId: string;

    @IsUUID()
    @IsOptional()
    sectionId?: string;

    @IsUUID()
    @IsNotEmpty()
    subjectId: string;

    @IsUUID()
    @IsNotEmpty()
    groupId: string;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;
}

export class SubmitAttemptDto {
    @IsUUID()
    @IsNotEmpty()
    examId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitAnswerDto)
    answers: SubmitAnswerDto[];
}

export class SubmitAnswerDto {
    @IsUUID()
    @IsNotEmpty()
    questionId: string;

    @IsUUID()
    @IsOptional()
    selectedOptionId?: string;

    @IsString()
    @IsOptional()
    textAnswer?: string;
}

export class GradeDescriptiveAnswerDto {
    @IsNumber()
    @Min(0)
    marksAwarded: number;
}

import { IsArray, IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class PromoteStudentsDto {
    @IsArray()
    @IsString({ each: true })
    studentIds: string[];

    @IsUUID()
    @IsNotEmpty()
    targetClassId: string;

    @IsUUID()
    @IsNotEmpty()
    targetSectionId: string;
}

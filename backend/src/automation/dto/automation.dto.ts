import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateAutomationConfigDto {
    @IsBoolean()
    @IsNotEmpty()
    isEnabled: boolean;

    @IsOptional()
    @IsString()
    template?: string;

    @IsOptional()
    @IsInt()
    triggerDays?: number;
}

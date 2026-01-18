import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsOptional()
    isbn?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    branchId: string;
}

export class BorrowBookDto {
    @IsString()
    @IsNotEmpty()
    bookId: string;

    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;
}

export class ReturnBookDto {
    @IsString()
    @IsNotEmpty()
    borrowRecordId: string;
}

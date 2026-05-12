import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsInt()
  @Min(0)
  floor: number;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  @IsNotEmpty()
  hostelId: string;
}

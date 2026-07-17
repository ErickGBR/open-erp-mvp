import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:mm' })
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:mm' })
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

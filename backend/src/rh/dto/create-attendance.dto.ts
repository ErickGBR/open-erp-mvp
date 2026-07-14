import { IsString, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  employeeId!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  clockIn?: Date;

  @IsOptional()
  @IsDateString()
  clockOut?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  breakMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  regularHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

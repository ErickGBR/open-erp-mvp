import { IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreateShiftAssignmentDto {
  @IsNumber()
  employeeId!: number;

  @IsNumber()
  branchId!: number;

  @IsNumber()
  shiftId!: number;

  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

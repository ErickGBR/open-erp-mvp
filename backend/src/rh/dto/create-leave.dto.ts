import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateLeaveDto {
  @IsNumber()
  employeeId!: number;

  @IsString()
  @IsIn(['vacation', 'sick', 'personal', 'other'])
  type!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsString, IsOptional, IsNumber, Min, IsDateString, IsIn } from 'class-validator';

export class CreateLoanDto {
  @IsNumber()
  employeeId!: number;

  @IsString()
  @IsIn(['loan', 'advance'])
  type!: string;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentAmount?: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

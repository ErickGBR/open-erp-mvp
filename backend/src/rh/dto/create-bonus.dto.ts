import { IsString, IsOptional, IsNumber, Min, IsDateString, IsIn } from 'class-validator';

export class CreateBonusDto {
  @IsNumber()
  employeeId!: number;

  @IsString()
  @IsIn(['performance', 'commission', 'christmas', 'other'])
  type!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsNumber()
  payrollPeriodId?: number;
}

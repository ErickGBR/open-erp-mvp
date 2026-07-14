import { IsString, IsDateString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsString()
  periodName!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

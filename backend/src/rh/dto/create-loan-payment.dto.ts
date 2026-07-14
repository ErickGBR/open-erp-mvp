import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateLoanPaymentDto {
  @IsNumber()
  loanId!: number;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

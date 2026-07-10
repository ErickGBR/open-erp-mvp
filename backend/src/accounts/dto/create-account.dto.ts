import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength, IsIn } from 'class-validator';

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'] as const;
const ACCOUNT_SUB_TYPES = [
  'current_asset', 'fixed_asset', 'other_asset',
  'current_liability', 'long_term_liability',
  'capital', 'retained_earnings',
  'operating_income', 'other_income',
  'operating_expense', 'administrative_expense', 'other_expense',
] as const;

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsIn(ACCOUNT_TYPES)
  type!: string;

  @IsOptional()
  @IsString()
  @IsIn(ACCOUNT_SUB_TYPES)
  subType?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

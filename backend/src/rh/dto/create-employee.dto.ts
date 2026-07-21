import { IsString, IsOptional, IsNumber, IsBoolean, IsEmail, Min, MaxLength, IsIn } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  dui?: string;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  nit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  nrc?: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  hireDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'hourly', 'biweekly'])
  salaryType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isssNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  afpNumber?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}

import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @IsNumber()
  warehouseId!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

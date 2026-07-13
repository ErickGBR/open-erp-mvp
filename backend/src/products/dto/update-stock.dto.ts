import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  referenceType?: 'purchase' | 'sale' | 'adjustment';

  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}


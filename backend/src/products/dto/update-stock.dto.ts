import { IsNumber, IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
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
  @IsIn(['purchase', 'sale', 'adjustment'])
  referenceType?: 'purchase' | 'sale' | 'adjustment';

  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}


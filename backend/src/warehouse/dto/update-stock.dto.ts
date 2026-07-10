import { IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  locationId!: number;

  @IsNumber()
  @Min(0)
  quantity!: number;
}

import { IsString, IsIn } from 'class-validator';

export class UpdateSaleStatusDto {
  @IsString()
  @IsIn(['paid', 'cancelled'])
  status!: string;
}

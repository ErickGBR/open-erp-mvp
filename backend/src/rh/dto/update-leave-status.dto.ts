import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

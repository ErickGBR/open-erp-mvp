import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

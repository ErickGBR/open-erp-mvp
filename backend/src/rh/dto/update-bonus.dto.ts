import { PartialType } from '@nestjs/mapped-types';
import { CreateBonusDto } from './create-bonus.dto';

export class UpdateBonusDto extends PartialType(CreateBonusDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftAssignmentDto } from './create-shift-assignment.dto';

export class UpdateShiftAssignmentDto extends PartialType(CreateShiftAssignmentDto) {}

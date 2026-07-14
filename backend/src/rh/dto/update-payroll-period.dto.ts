import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollPeriodDto } from './create-payroll-period.dto';

export class UpdatePayrollPeriodDto extends PartialType(CreatePayrollPeriodDto) {}

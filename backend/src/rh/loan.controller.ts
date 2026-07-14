import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';

@Controller('rh/loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loanService.findAll({
      employeeId: employeeId ? parseInt(employeeId, 10) : undefined,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateLoanDto) {
    return this.loanService.create(dto);
  }

  @Get(':id/payments')
  getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.getPayments(id);
  }

  @Post(':id/payments')
  @Roles(UserRole.ADMIN)
  makePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Omit<CreateLoanPaymentDto, 'loanId'>,
  ) {
    return this.loanService.makePayment({ ...dto, loanId: id } as CreateLoanPaymentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.delete(id);
  }
}

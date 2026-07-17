import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe, Res, HttpStatus, Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User, UserRole } from '../users/user.entity';
import { PayrollService } from './payroll.service';
import { PayrollSchedulerService } from './payroll-scheduler.service';
import { PdfService } from './pdf.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';
import { Company } from '../company/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('rh/payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollSchedulerService: PayrollSchedulerService,
    private readonly pdfService: PdfService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // --- Periods ---

  @Get('periods')
  findAllPeriods(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.payrollService.findAllPeriods({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('periods/:id')
  findPeriodById(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.findPeriodById(id);
  }

  @Post('periods')
  @Roles(UserRole.ADMIN)
  createPeriod(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.createPeriod(dto);
  }

  @Patch('periods/:id')
  @Roles(UserRole.ADMIN)
  updatePeriod(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayrollPeriodDto) {
    return this.payrollService.updatePeriod(id, dto);
  }

  @Post('periods/:id/calculate')
  @Roles(UserRole.ADMIN)
  calculate(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.calculate(id);
  }

  @Post('periods/:id/approve')
  @Roles(UserRole.ADMIN)
  approve(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const approvedById = (req.user as User)?.id;
    return this.payrollService.approvePeriod(id, approvedById);
  }

  @Post('periods/:id/pay')
  @Roles(UserRole.ADMIN)
  markAsPaid(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const paidById = (req.user as User)?.id;
    return this.payrollService.markAsPaid(id, paidById);
  }

  @Delete('periods/:id')
  @Roles(UserRole.ADMIN)
  deletePeriod(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.deletePeriod(id);
  }

  // --- Details ---

  @Get('periods/:id/details')
  getDetails(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.getDetailsByPeriod(id);
  }

  @Get('details/:id')
  getDetailById(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.getDetailById(id);
  }

  // --- PDF ---

  @Get('details/:id/pdf')
  async generatePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const detail = await this.payrollService.getDetailById(id);
    const period = detail.payrollPeriod;
    const employee = detail.employee;

    const company = await this.companyRepository.findOne({ where: {} });
    const companyInfo = {
      name: company?.name || 'Mi Empresa',
      nit: company?.nit || '',
      nrc: company?.nrc || null,
      logoUrl: company?.logoUrl || null,
    };

    const pdfBuffer = await this.pdfService.generatePayslip(
      detail,
      period,
      `${employee.firstName} ${employee.lastName}`,
      employee.code,
      employee.dui || '',
      employee.nit || '',
      employee.department?.name || '',
      companyInfo,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="payslip-${period.id}-${employee.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  // --- Email ---

  @Post('periods/:id/send-emails')
  @Roles(UserRole.ADMIN)
  async sendEmails(@Param('id', ParseIntPipe) id: number) {
    return this.payrollSchedulerService.sendPayslipsForPeriod(id);
  }
}

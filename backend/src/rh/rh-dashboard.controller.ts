import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { LeaveRequest } from './leave-request.entity';
import { PayrollPeriod } from './payroll-period.entity';

@Controller('rh/dashboard')
@UseGuards(JwtAuthGuard)
export class RhDashboardController {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRepository: Repository<LeaveRequest>,
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
  ) {}

  @Get('stats')
  async getStats() {
    const [totalEmployees, activeEmployees, pendingLeaves, pendingPayroll] =
      await Promise.all([
        this.employeeRepository.count(),
        this.employeeRepository.count({ where: { isActive: true } }),
        this.leaveRepository.count({ where: { status: 'pending' } }),
        this.periodRepository.count({ where: { status: 'calculated' } }),
      ]);

    return {
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      pendingPayroll,
    };
  }
}

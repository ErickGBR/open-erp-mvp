import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Department } from './department.entity';
import { Employee } from './employee.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { LeaveRequest } from './leave-request.entity';
import { Bonus } from './bonus.entity';
import { EmployeeLoan } from './employee-loan.entity';
import { LoanPayment } from './loan-payment.entity';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollDetail } from './payroll-detail.entity';
import { PayrollEmailLog } from './payroll-email-log.entity';
import { Company } from '../company/company.entity';

// Services
import { DepartmentService } from './department.service';
import { EmployeeService } from './employee.service';
import { AttendanceService } from './attendance.service';
import { LeaveService } from './leave.service';
import { BonusService } from './bonus.service';
import { LoanService } from './loan.service';
import { PayrollService } from './payroll.service';
import { PayrollCalculatorService } from './payroll-calculator.service';
import { PdfService } from './pdf.service';
import { EmailService } from './email.service';
import { PayrollSchedulerService } from './payroll-scheduler.service';

// Controllers
import { DepartmentController } from './department.controller';
import { EmployeeController } from './employee.controller';
import { AttendanceController } from './attendance.controller';
import { LeaveController } from './leave.controller';
import { BonusController } from './bonus.controller';
import { LoanController } from './loan.controller';
import { PayrollController } from './payroll.controller';
import { RhDashboardController } from './rh-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Employee,
      AttendanceRecord,
      LeaveRequest,
      Bonus,
      EmployeeLoan,
      LoanPayment,
      PayrollPeriod,
      PayrollDetail,
      PayrollEmailLog,
      Company,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    DepartmentController,
    EmployeeController,
    AttendanceController,
    LeaveController,
    BonusController,
    LoanController,
    PayrollController,
    RhDashboardController,
  ],
  providers: [
    DepartmentService,
    EmployeeService,
    AttendanceService,
    LeaveService,
    BonusService,
    LoanService,
    PayrollService,
    PayrollCalculatorService,
    PdfService,
    EmailService,
    PayrollSchedulerService,
  ],
  exports: [
    DepartmentService,
    EmployeeService,
    PayrollService,
    PdfService,
    EmailService,
  ],
})
export class RhModule {}

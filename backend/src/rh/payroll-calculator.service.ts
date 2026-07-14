import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollDetail } from './payroll-detail.entity';
import { Employee } from './employee.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { Bonus } from './bonus.entity';
import { EmployeeLoan } from './employee-loan.entity';

interface AttendanceSummary {
  regularHours: number;
  overtimeHours: number;
}

interface BonusSummary {
  performanceBonuses: number;
  commissions: number;
}

interface SocialDeductions {
  isssDeduction: number;
  afpDeduction: number;
}

@Injectable()
export class PayrollCalculatorService {
  private readonly logger = new Logger(PayrollCalculatorService.name);

  // ISSS cap: 3% of $1,000 = $30 max
  private static readonly ISSS_RATE = 0.03;
  private static readonly ISSS_MAX = 30;

  // AFP rate: 7.25%, cap at ~$290 (7.25% of $4,000)
  private static readonly AFP_RATE = 0.0725;
  private static readonly AFP_MAX_SALARY = 4000;

  /**
   * ISR (Impuesto Sobre la Renta) progressive brackets for El Salvador.
   * Based on monthly taxable income after ISSS and AFP deductions.
   *
   * Ranges (monthly):
   *   0.01  - 487.00   → 0%
   *   487.01 - 642.00  → 10% over $487
   *   642.01 - 915.00  → $15.50 + 10% over $642
   *   915.01 - 2,058.00 → $42.80 + 20% over $915
   *   2,058.01+        → $271.40 + 30% over $2,058
   */
  private static readonly ISR_BRACKETS = [
    { min: 0,       max: 487,    base: 0,      rate: 0,    excessOver: 0 },
    { min: 487.01,  max: 642,    base: 0,      rate: 0.10, excessOver: 487 },
    { min: 642.01,  max: 915,    base: 15.50,  rate: 0.10, excessOver: 642 },
    { min: 915.01,  max: 2058,   base: 42.80,  rate: 0.20, excessOver: 915 },
    { min: 2058.01, max: Infinity, base: 271.40, rate: 0.30, excessOver: 2058 },
  ] as const;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollDetail)
    private readonly detailRepository: Repository<PayrollDetail>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
    @InjectRepository(EmployeeLoan)
    private readonly loanRepository: Repository<EmployeeLoan>,
  ) {}

  async calculate(period: PayrollPeriod): Promise<PayrollPeriod> {
    const { id: periodId, startDate, endDate } = period;

    this.logger.log(`Calculating payroll for period ${period.periodName} (${startDate} - ${endDate})`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch all active employees
      const employees = await this.employeeRepository.find({
        where: { isActive: true, status: 'active' },
        relations: { department: true },
      });

      this.logger.log(`Found ${employees.length} active employees`);

      // Delete existing details for this period (recalculation)
      await queryRunner.manager.delete(PayrollDetail, { payrollPeriodId: periodId });

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalEmployees = 0;

      for (const employee of employees) {
        const detail = await this.calculateEmployee(employee, periodId, startDate, endDate);

        const savedDetail = queryRunner.manager.create(PayrollDetail, detail);
        await queryRunner.manager.save(savedDetail);

        totalGross += Number(detail.grossPay);
        totalDeductions += Number(detail.totalDeductions);
        totalNet += Number(detail.netPay);
        totalEmployees++;
      }

      // Update period totals
      period.status = 'calculated';
      period.totalGross = totalGross;
      period.totalDeductions = totalDeductions;
      period.totalNet = totalNet;
      period.totalEmployees = totalEmployees;

      const savedPeriod = await queryRunner.manager.save(period);

      await queryRunner.commitTransaction();

      return savedPeriod;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        this.logger.error(`Payroll calculation failed: ${error.message}`);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateEmployee(
    employee: Employee,
    periodId: number,
    startDate: string,
    endDate: string,
  ): Promise<Partial<PayrollDetail>> {
    const baseSalary = Number(employee.baseSalary);

    // Attendance & overtime
    const { regularHours, overtimeHours } = await this.getAttendanceSummary(employee.id, startDate, endDate);
    const hourlyRate = employee.salaryType === 'hourly'
      ? baseSalary
      : baseSalary / (30 * 8); // monthly salary / avg work days × 8h
    const overtimePay = overtimeHours * hourlyRate * 1.5;

    // Bonuses
    const { performanceBonuses, commissions } = await this.getBonusSummary(employee.id, periodId);

    // Gross pay
    const grossPay = baseSalary + overtimePay + performanceBonuses + commissions;

    // Social deductions (ISSS + AFP)
    const { isssDeduction, afpDeduction } = this.calculateSocialDeductions(baseSalary);

    // ISR
    const taxableIncome = grossPay - isssDeduction - afpDeduction;
    const isrDeduction = this.calculateISR(taxableIncome);

    // Loan deduction
    const loanDeduction = await this.getLoanDeduction(employee.id);

    // Totals
    const totalDeductions = isssDeduction + afpDeduction + isrDeduction + loanDeduction;
    const netPay = Math.max(0, grossPay - totalDeductions);

    return {
      payrollPeriodId: periodId,
      employeeId: employee.id,
      baseSalary,
      regularHours,
      overtimeHours,
      overtimePay,
      bonuses: performanceBonuses,
      commissions,
      grossPay,
      isssDeduction,
      afpDeduction,
      isrDeduction,
      loanDeduction,
      otherDeductions: 0,
      totalDeductions,
      netPay,
      bankAccount: '',  // Not copied from employee to avoid leaking sensitive data;
                         // fetch from Employee entity when needed for payments
      status: 'pending',
    };
  }

  private async getAttendanceSummary(
    employeeId: number,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceSummary> {
    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        employeeId,
        date: Between(startDate, endDate),
      },
    });

    const regularHours = attendanceRecords.reduce((sum, r) => sum + Number(r.regularHours), 0);
    const overtimeHours = attendanceRecords.reduce((sum, r) => sum + Number(r.overtimeHours), 0);

    return { regularHours, overtimeHours };
  }

  private async getBonusSummary(
    employeeId: number,
    periodId: number,
  ): Promise<BonusSummary> {
    const bonuses = await this.bonusRepository.find({
      where: { employeeId, payrollPeriodId: periodId },
    });

    const performanceBonuses = bonuses
      .filter(b => b.type === 'performance' || b.type === 'other')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const commissions = bonuses
      .filter(b => b.type === 'commission')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    return { performanceBonuses, commissions };
  }

  private calculateSocialDeductions(baseSalary: number): SocialDeductions {
    const isssDeduction = Math.min(baseSalary * PayrollCalculatorService.ISSS_RATE, PayrollCalculatorService.ISSS_MAX);

    const afpBase = Math.min(baseSalary, PayrollCalculatorService.AFP_MAX_SALARY);
    const afpDeduction = afpBase * PayrollCalculatorService.AFP_RATE;

    return { isssDeduction, afpDeduction };
  }

  private async getLoanDeduction(employeeId: number): Promise<number> {
    const activeLoans = await this.loanRepository.find({
      where: { employeeId, status: 'active' },
    });

    return activeLoans.reduce((sum, loan) => sum + Number(loan.installmentAmount || 0), 0);
  }

  private calculateISR(taxableIncome: number): number {
    const bracket = PayrollCalculatorService.ISR_BRACKETS.find(
      b => taxableIncome > b.min && taxableIncome <= b.max,
    );
    if (!bracket) return 0;
    return bracket.base + (taxableIncome - bracket.excessOver) * bracket.rate;
  }
}

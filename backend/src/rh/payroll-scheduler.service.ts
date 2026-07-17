import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollDetail } from './payroll-detail.entity';
import { PayrollEmailLog } from './payroll-email-log.entity';
import { Employee } from './employee.entity';
import { Company } from '../company/company.entity';
import { PdfService } from './pdf.service';
import { EmailService } from './email.service';

@Injectable()
export class PayrollSchedulerService {
  private readonly logger = new Logger(PayrollSchedulerService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollDetail)
    private readonly detailRepository: Repository<PayrollDetail>,
    @InjectRepository(PayrollEmailLog)
    private readonly emailLogRepository: Repository<PayrollEmailLog>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Runs daily at 8 AM to check for approved/paid periods
   * that have pending payslips to send.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async processPendingPayslipEmails(): Promise<void> {
    this.logger.log('Checking for pending payslip emails...');

    const periods = await this.periodRepository.find({
      where: { status: In(['approved', 'paid']) },
      order: { id: 'DESC' },
    });

    for (const period of periods) {
      await this.sendPayslipsForPeriod(period.id);
    }
  }

  async sendPayslipsForPeriod(periodId: number): Promise<{ sent: number; failed: number }> {
    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) {
      this.logger.warn(`Period ${periodId} not found`);
      return { sent: 0, failed: 0 };
    }

    const details = await this.detailRepository.find({
      where: { payrollPeriodId: periodId },
      relations: { employee: { department: true } },
    });

    // Get company info
    const company = await this.companyRepository.findOne({ where: {} });
    const companyInfo = {
      name: company?.name || 'Mi Empresa',
      nit: company?.nit || '',
      nrc: company?.nrc || null,
      logoUrl: company?.logoUrl || null,
    };

    let sent = 0;
    let failed = 0;

    for (const detail of details) {
      // Check if already sent
      const existingLog = await this.emailLogRepository.findOne({
        where: { payrollPeriodId: periodId, employeeId: detail.employeeId },
      });
      if (existingLog) {
        continue; // Already sent
      }

      try {
        const employee = detail.employee;
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

        const success = await this.emailService.sendPayslip(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          period.periodName,
          pdfBuffer,
        );

        // Log the result
        const logEntry = this.emailLogRepository.create({
          payrollPeriodId: periodId,
          employeeId: detail.employeeId,
          status: success ? 'sent' : 'failed',
          errorMessage: success ? null : 'Email send failed',
        });
        await this.emailLogRepository.save(logEntry);

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error: unknown) {
        this.logger.error(`Error sending payslip for employee ${detail.employeeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }
    }

    this.logger.log(`Period ${periodId}: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }
}

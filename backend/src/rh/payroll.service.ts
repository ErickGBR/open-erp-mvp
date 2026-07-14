import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollDetail } from './payroll-detail.entity';
import { PayrollCalculatorService } from './payroll-calculator.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollDetail)
    private readonly detailRepository: Repository<PayrollDetail>,
    private readonly calculatorService: PayrollCalculatorService,
  ) {}

  async findAllPeriods(query?: { status?: string; page?: number; limit?: number }): Promise<{ data: PayrollPeriod[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: FindOptionsWhere<PayrollPeriod> = {};
    if (query?.status) {
      where.status = query.status;
    }

    const [data, total] = await this.periodRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findPeriodById(id: number): Promise<PayrollPeriod> {
    const period = await this.periodRepository.findOne({
      where: { id },
      relations: { details: { employee: true } },
    });
    if (!period) {
      throw new NotFoundException(`Payroll period with id ${id} not found`);
    }
    return period;
  }

  async createPeriod(dto: CreatePayrollPeriodDto): Promise<PayrollPeriod> {
    // Check for overlapping periods
    const overlapping = await this.periodRepository
      .createQueryBuilder('pp')
      .where(
        '(pp.startDate <= :endDate AND pp.endDate >= :startDate)',
        { startDate: dto.startDate, endDate: dto.endDate },
      )
      .getCount();

    if (overlapping > 0) {
      throw new BadRequestException('Overlapping payroll period exists');
    }

    const period = this.periodRepository.create({
      periodName: dto.periodName,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'draft',
    });
    return this.periodRepository.save(period);
  }

  async updatePeriod(id: number, dto: UpdatePayrollPeriodDto): Promise<PayrollPeriod> {
    const period = await this.findPeriodById(id);
    if (period.status !== 'draft') {
      throw new BadRequestException('Can only update draft periods');
    }
    Object.assign(period, dto);
    return this.periodRepository.save(period);
  }

  async calculate(id: number): Promise<PayrollPeriod> {
    const period = await this.findPeriodById(id);
    if (period.status !== 'draft') {
      throw new BadRequestException('Period must be in draft status to calculate');
    }
    return this.calculatorService.calculate(period);
  }

  async approvePeriod(id: number, approvedById?: number): Promise<PayrollPeriod> {
    const period = await this.findPeriodById(id);
    if (period.status !== 'calculated') {
      throw new BadRequestException('Period must be in calculated status to approve');
    }
    period.status = 'approved';
    period.approvedAt = new Date();
    if (approvedById) {
      period.approvedById = approvedById;
    }
    return this.periodRepository.save(period);
  }

  async markAsPaid(id: number, paidById?: number): Promise<PayrollPeriod> {
    const period = await this.findPeriodById(id);
    if (period.status !== 'approved') {
      throw new BadRequestException('Period must be approved before marking as paid');
    }

    period.status = 'paid';
    period.paidAt = new Date();
    if (paidById) {
      period.paidById = paidById;
    }

    // Mark all details as paid
    await this.detailRepository.update(
      { payrollPeriodId: id },
      { status: 'paid' },
    );

    return this.periodRepository.save(period);
  }

  async getDetailsByPeriod(periodId: number): Promise<PayrollDetail[]> {
    return this.detailRepository.find({
      where: { payrollPeriodId: periodId },
      relations: { employee: { department: true } },
      order: { id: 'ASC' },
    });
  }

  async getDetailById(id: number): Promise<PayrollDetail> {
    const detail = await this.detailRepository.findOne({
      where: { id },
      relations: { employee: { department: true }, payrollPeriod: true },
    });
    if (!detail) {
      throw new NotFoundException(`Payroll detail with id ${id} not found`);
    }
    return detail;
  }

  async deletePeriod(id: number): Promise<void> {
    const period = await this.findPeriodById(id);
    if (period.status !== 'draft') {
      throw new BadRequestException('Can only delete draft periods');
    }
    await this.detailRepository.delete({ payrollPeriodId: id });
    await this.periodRepository.remove(period);
  }
}

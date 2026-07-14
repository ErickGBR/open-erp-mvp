import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeLoan } from './employee-loan.entity';
import { LoanPayment } from './loan-payment.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(EmployeeLoan)
    private readonly loanRepository: Repository<EmployeeLoan>,
    @InjectRepository(LoanPayment)
    private readonly paymentRepository: Repository<LoanPayment>,
  ) {}

  async findAll(query?: { employeeId?: number; status?: string; page?: number; limit?: number }): Promise<{ data: EmployeeLoan[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: any = {};

    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.status) {
      where.status = query.status;
    }

    const [data, total] = await this.loanRepository.findAndCount({
      where,
      relations: { employee: true, payments: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<EmployeeLoan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: { employee: true, payments: true },
    });
    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }
    return loan;
  }

  async getPayments(loanId: number): Promise<LoanPayment[]> {
    return this.paymentRepository.find({
      where: { loanId },
      order: { paymentDate: 'DESC' },
    });
  }

  async create(dto: CreateLoanDto): Promise<EmployeeLoan> {
    const loan = this.loanRepository.create({
      ...dto,
      remainingBalance: dto.totalAmount,
    } as any);
    return this.loanRepository.save(loan) as unknown as EmployeeLoan;
  }

  async makePayment(dto: CreateLoanPaymentDto): Promise<LoanPayment> {
    const loan = await this.findById(dto.loanId);
    if (loan.status !== 'active') {
      throw new BadRequestException('Loan is not active');
    }
    if (dto.amount > loan.remainingBalance) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining balance (${loan.remainingBalance})`,
      );
    }

    const payment = this.paymentRepository.create(dto as any);
    const saved = await this.paymentRepository.save(payment) as unknown as LoanPayment;

    loan.remainingBalance = Number(loan.remainingBalance) - dto.amount;
    if (loan.remainingBalance <= 0) {
      loan.remainingBalance = 0;
      loan.status = 'completed';
    }
    await this.loanRepository.save(loan);

    return saved;
  }

  async delete(id: number): Promise<void> {
    const loan = await this.findById(id);
    if (loan.status !== 'active') {
      throw new BadRequestException('Cannot delete a non-active loan');
    }
    await this.paymentRepository.delete({ loanId: id });
    await this.loanRepository.remove(loan);
  }
}

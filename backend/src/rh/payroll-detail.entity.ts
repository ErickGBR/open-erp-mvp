import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { Employee } from './employee.entity';

@Entity('payroll_details')
export class PayrollDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PayrollPeriod, pp => pp.details)
  @JoinColumn({ name: 'payrollPeriodId' })
  payrollPeriod!: PayrollPeriod;

  @Column({ type: 'int' })
  payrollPeriodId!: number;

  @ManyToOne(() => Employee, emp => emp.payrollDetails)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  baseSalary!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  regularHours!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overtimePay!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonuses!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  isssDeduction!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  afpDeduction!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  isrDeduction!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loanDeduction!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherDeductions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccount!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

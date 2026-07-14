import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PayrollDetail } from './payroll-detail.entity';

@Entity('payroll_periods')
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  periodName!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGross!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalNet!: number;

  @Column({ default: 0 })
  totalEmployees!: number;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  approvedById!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  paidById!: number | null;

  @OneToMany(() => PayrollDetail, detail => detail.payrollPeriod)
  details!: PayrollDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

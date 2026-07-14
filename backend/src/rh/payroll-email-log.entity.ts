import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payroll_email_logs')
export class PayrollEmailLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  payrollPeriodId!: number;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;
}

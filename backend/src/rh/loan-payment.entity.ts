import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EmployeeLoan } from './employee-loan.entity';

@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EmployeeLoan, loan => loan.payments)
  @JoinColumn({ name: 'loanId' })
  loan!: EmployeeLoan;

  @Column({ type: 'int' })
  loanId!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'date' })
  paymentDate!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

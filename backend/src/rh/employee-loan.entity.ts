import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { LoanPayment } from './loan-payment.entity';

@Entity('employee_loans')
export class EmployeeLoan {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, emp => emp.loans)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'varchar', length: 20, default: 'loan' })
  type!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingBalance!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  installmentAmount!: number | null;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @OneToMany(() => LoanPayment, payment => payment.loan)
  payments!: LoanPayment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

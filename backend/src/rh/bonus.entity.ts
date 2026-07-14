import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('employee_bonuses')
export class Bonus {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, emp => emp.bonuses)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'varchar', length: 20, default: 'performance' })
  type!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'int', nullable: true })
  payrollPeriodId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

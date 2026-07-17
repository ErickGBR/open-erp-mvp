import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Branch } from './branch.entity';
import { Shift } from './shift.entity';

@Entity('shift_assignments')
export class ShiftAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'int' })
  branchId!: number;

  @Column({ type: 'int' })
  shiftId!: number;

  /** 0=Sunday, 1=Monday … 6=Saturday */
  @Column({ type: 'int' })
  dayOfWeek!: number;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @ManyToOne(() => Shift)
  @JoinColumn({ name: 'shiftId' })
  shift!: Shift;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

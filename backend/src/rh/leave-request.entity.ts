import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, emp => emp.leaveRequests)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'varchar', length: 20, default: 'personal' })
  type!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string;

  @Column({ type: 'int', nullable: true })
  approvedById!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

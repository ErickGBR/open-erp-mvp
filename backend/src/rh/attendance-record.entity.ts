import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, emp => emp.attendanceRecords)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'timestamp', nullable: true })
  clockIn!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  clockOut!: Date | null;

  @Column({ default: 0 })
  breakMinutes!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  regularHours!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

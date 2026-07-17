import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Department } from './department.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { LeaveRequest } from './leave-request.entity';
import { Bonus } from './bonus.entity';
import { EmployeeLoan } from './employee-loan.entity';
import { PayrollDetail } from './payroll-detail.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  @Exclude()
  dui?: string;

  @Column({ type: 'varchar', length: 17, unique: true, nullable: true })
  @Exclude()
  nit?: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  nrc!: string | null;

  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'date' })
  hireDate!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'monthly' })
  salaryType!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  baseSalary!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Exclude()
  bankName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Exclude()
  bankAccount!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Exclude()
  isssNumber!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Exclude()
  afpNumber!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Department, dept => dept.employees)
  @JoinColumn({ name: 'departmentId' })
  department!: Department | null;

  @Column({ type: 'int', nullable: true })
  departmentId!: number | null;

  @OneToMany(() => AttendanceRecord, att => att.employee)
  attendanceRecords!: AttendanceRecord[];

  @OneToMany(() => LeaveRequest, leave => leave.employee)
  leaveRequests!: LeaveRequest[];

  @OneToMany(() => Bonus, bonus => bonus.employee)
  bonuses!: Bonus[];

  @OneToMany(() => EmployeeLoan, loan => loan.employee)
  loans!: EmployeeLoan[];

  @OneToMany(() => PayrollDetail, pd => pd.employee)
  payrollDetails!: PayrollDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

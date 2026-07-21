import { Controller, Post, Get, Body, Param, ParseIntPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { ShiftAssignment } from './shift-assignment.entity';
import { Shift } from './shift.entity';

/**
 * Public controller for QR-based attendance marking.
 * No authentication required — only uses the employee's unique QR token.
 */
@Controller('public/attendance')
export class PublicAttendanceController {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(ShiftAssignment)
    private readonly assignmentRepository: Repository<ShiftAssignment>,
  ) {}

  /**
   * Lookup employee by QR token — used by the public scanning page
   * to identify the employee after scanning the QR code.
   */
  @Get('lookup/:token')
  async lookupByToken(@Param('token') token: string) {
    const employee = await this.employeeRepository.findOne({
      where: { qrToken: token, isActive: true },
      relations: { department: true },
    });
    if (!employee) {
      throw new NotFoundException('Invalid or expired QR token');
    }
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      code: employee.code,
      department: employee.department?.name ?? null,
    };
  }

  /**
   * Get today's assignments for an employee — determines which shifts/branches
   * the employee should be at based on the current day of week.
   */
  @Get('assignments/:employeeId')
  async getTodayAssignments(@Param('employeeId', ParseIntPipe) employeeId: number) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday … 6=Saturday
    const dateStr = today.toISOString().split('T')[0];

    const assignments = await this.assignmentRepository.find({
      where: {
        employeeId,
        dayOfWeek,
        isActive: true,
      },
      relations: { branch: true, shift: true },
    });

    // Filter by date range
    const active = assignments.filter((a) => {
      if (a.endDate && a.endDate < dateStr) return false;
      if (a.startDate > dateStr) return false;
      return true;
    });

    return active.map((a) => ({
      id: a.id,
      branch: { id: a.branch.id, name: a.branch.name },
      shift: {
        id: a.shift.id,
        name: a.shift.name,
        startTime: a.shift.startTime,
        endTime: a.shift.endTime,
      },
    }));
  }

  /**
   * Mark clock-in or clock-out using QR token.
   * This is the main endpoint called from the public scanning page.
   */
  @Post('marcar')
  async marcar(
    @Body() body: { token: string; branchId: number; shiftId: number; type: 'in' | 'out' },
  ) {
    const { token, branchId, shiftId, type } = body;
    if (!token || !branchId || !shiftId || !type) {
      throw new BadRequestException('Missing required fields: token, branchId, shiftId, type');
    }

    const employee = await this.employeeRepository.findOne({
      where: { qrToken: token, isActive: true },
    });
    if (!employee) {
      throw new NotFoundException('Invalid or expired QR token');
    }

    const today = new Date().toISOString().split('T')[0];

    // Find or create today's attendance record
    let record = await this.attendanceRepository.findOne({
      where: { employeeId: employee.id, date: today },
    });

    if (type === 'in') {
      if (record && record.clockIn) {
        throw new BadRequestException('Already clocked in today');
      }
      if (!record) {
        record = this.attendanceRepository.create({
          employeeId: employee.id,
          date: today,
          clockIn: new Date(),
          notes: `QR scan — branch ${branchId}, shift ${shiftId}`,
        });
      } else {
        record.clockIn = new Date();
        record.notes = `QR scan — branch ${branchId}, shift ${shiftId}`;
      }
    } else if (type === 'out') {
      if (!record || !record.clockIn) {
        throw new BadRequestException('Must clock in before clocking out');
      }
      if (record.clockOut) {
        throw new BadRequestException('Already clocked out today');
      }
      record.clockOut = new Date();

      // Auto-calculate hours
      const clockIn = new Date(record.clockIn).getTime();
      const clockOut = record.clockOut.getTime();
      const totalMs = clockOut - clockIn;
      const totalHours = totalMs / (1000 * 60 * 60);
      const breakHours = (record.breakMinutes || 0) / 60;
      const workedHours = Math.max(0, totalHours - breakHours);

      if (workedHours <= 8) {
        record.regularHours = Math.round(workedHours * 100) / 100;
        record.overtimeHours = 0;
      } else {
        record.regularHours = 8;
        record.overtimeHours = Math.round((workedHours - 8) * 100) / 100;
      }
    }

    if (!record) {
      throw new BadRequestException('Could not process attendance record');
    }

    const saved = await this.attendanceRepository.save(record);
    return {
      success: true,
      type,
      employee: `${employee.firstName} ${employee.lastName}`,
      time: type === 'in' ? saved.clockIn : saved.clockOut,
    };
  }
}

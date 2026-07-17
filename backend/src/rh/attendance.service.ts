import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async findAll(query?: { employeeId?: number; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<{ data: AttendanceRecord[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: any = {};

    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.startDate && query?.endDate) {
      where.date = Between(query.startDate, query.endDate);
    } else if (query?.startDate) {
      where.date = query.startDate;
    }

    const [data, total] = await this.attendanceRepository.findAndCount({
      where,
      relations: { employee: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<AttendanceRecord> {
    const record = await this.attendanceRepository.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!record) {
      throw new NotFoundException(`Attendance record with id ${id} not found`);
    }
    return record;
  }

  async findByEmployeeAndDate(employeeId: number, date: string): Promise<AttendanceRecord | null> {
    return this.attendanceRepository.findOne({
      where: { employeeId, date },
    });
  }

  async clockIn(employeeId: number): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.findByEmployeeAndDate(employeeId, today);
    if (existing) {
      throw new ConflictException('Already clocked in today');
    }

    const record = this.attendanceRepository.create({
      employeeId,
      date: today,
      clockIn: new Date(),
    });
    return this.attendanceRepository.save(record);
  }

  async clockOut(employeeId: number): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const record = await this.findByEmployeeAndDate(employeeId, today);
    if (!record) {
      throw new BadRequestException('No clock-in record found for today');
    }
    if (record.clockOut) {
      throw new ConflictException('Already clocked out today');
    }

    record.clockOut = new Date();

    if (!record.clockIn) {
      throw new BadRequestException('Clock-in time is missing');
    }

    // Calculate regular hours (default 8h, minus break)
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

    return this.attendanceRepository.save(record);
  }

  async create(dto: CreateAttendanceDto): Promise<AttendanceRecord> {
    const existing = await this.findByEmployeeAndDate(dto.employeeId, dto.date);
    if (existing) {
      throw new ConflictException(`Attendance record already exists for employee ${dto.employeeId} on ${dto.date}`);
    }

    const record = this.attendanceRepository.create(dto);
    return this.attendanceRepository.save(record);
  }

  async update(id: number, dto: Partial<CreateAttendanceDto>): Promise<AttendanceRecord> {
    const record = await this.findById(id);
    Object.assign(record, dto);
    return this.attendanceRepository.save(record);
  }

  async delete(id: number): Promise<void> {
    const record = await this.findById(id);
    await this.attendanceRepository.remove(record);
  }
}

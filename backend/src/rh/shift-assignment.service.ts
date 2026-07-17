import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftAssignment } from './shift-assignment.entity';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentRepository: Repository<ShiftAssignment>,
  ) {}

  async findAll(query?: {
    employeeId?: number;
    branchId?: number;
    shiftId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: ShiftAssignment[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: any = {};

    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.branchId) {
      where.branchId = query.branchId;
    }
    if (query?.shiftId) {
      where.shiftId = query.shiftId;
    }

    const [data, total] = await this.shiftAssignmentRepository.findAndCount({
      where,
      relations: { employee: true, branch: true, shift: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<ShiftAssignment> {
    const assignment = await this.shiftAssignmentRepository.findOne({
      where: { id },
      relations: { employee: true, branch: true, shift: true },
    });
    if (!assignment) {
      throw new NotFoundException(`Shift assignment with id ${id} not found`);
    }
    return assignment;
  }

  async findByEmployee(employeeId: number): Promise<ShiftAssignment[]> {
    return this.shiftAssignmentRepository.find({
      where: { employeeId },
      relations: { employee: true, branch: true, shift: true },
      order: { startDate: 'DESC' },
    });
  }

  async findByEmployeeAndDay(employeeId: number, dayOfWeek: number): Promise<ShiftAssignment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.shiftAssignmentRepository.createQueryBuilder('sa')
      .leftJoinAndSelect('sa.employee', 'employee')
      .leftJoinAndSelect('sa.branch', 'branch')
      .leftJoinAndSelect('sa.shift', 'shift')
      .where('sa.employeeId = :employeeId', { employeeId })
      .andWhere('sa.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('sa.isActive = :isActive', { isActive: true })
      .andWhere('sa.startDate <= :today', { today })
      .andWhere('(sa.endDate IS NULL OR sa.endDate >= :today)', { today })
      .orderBy('sa.startDate', 'DESC')
      .getMany();
  }

  async create(dto: CreateShiftAssignmentDto): Promise<ShiftAssignment> {
    const assignment: ShiftAssignment = this.shiftAssignmentRepository.create(dto) as ShiftAssignment;
    return this.shiftAssignmentRepository.save(assignment);
  }

  async update(id: number, dto: UpdateShiftAssignmentDto): Promise<ShiftAssignment> {
    const assignment = await this.findById(id);
    Object.assign(assignment, dto);
    return this.shiftAssignmentRepository.save(assignment);
  }

  async delete(id: number): Promise<void> {
    const assignment = await this.findById(id);
    await this.shiftAssignmentRepository.remove(assignment);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepository: Repository<LeaveRequest>,
  ) {}

  async findAll(query?: { employeeId?: number; status?: string; type?: string; page?: number; limit?: number }): Promise<{ data: LeaveRequest[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: any = {};

    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.type) {
      where.type = query.type;
    }

    const [data, total] = await this.leaveRepository.findAndCount({
      where,
      relations: { employee: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }
    return leave;
  }

  async create(dto: CreateLeaveDto): Promise<LeaveRequest> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new BadRequestException('End date must be after start date');
    }

    const leave = this.leaveRepository.create(dto as any);
    return this.leaveRepository.save(leave) as unknown as LeaveRequest;
  }

  async updateStatus(id: number, dto: UpdateLeaveStatusDto, approvedById?: number): Promise<LeaveRequest> {
    const leave = await this.findById(id);
    if (leave.status !== 'pending') {
      throw new BadRequestException(`Leave request is already ${leave.status}`);
    }

    leave.status = dto.status;
    leave.notes = dto.notes ?? leave.notes;
    leave.approvedAt = new Date();
    if (approvedById) {
      leave.approvedById = approvedById;
    }

    return this.leaveRepository.save(leave);
  }

  async delete(id: number): Promise<void> {
    const leave = await this.findById(id);
    if (leave.status !== 'pending') {
      throw new BadRequestException('Cannot delete a non-pending leave request');
    }
    await this.leaveRepository.remove(leave);
  }
}

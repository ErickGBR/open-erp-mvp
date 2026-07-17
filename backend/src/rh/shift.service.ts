import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Shift[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.shiftRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift with id ${id} not found`);
    }
    return shift;
  }

  async create(dto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create(dto as any);
    return this.shiftRepository.save(shift) as unknown as Shift;
  }

  async update(id: number, dto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findById(id);
    Object.assign(shift, dto);
    return this.shiftRepository.save(shift);
  }

  async delete(id: number): Promise<void> {
    const shift = await this.findById(id);
    shift.isActive = false;
    await this.shiftRepository.save(shift);
  }
}

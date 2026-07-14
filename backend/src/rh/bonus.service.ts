import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bonus } from './bonus.entity';
import { CreateBonusDto } from './dto/create-bonus.dto';
import { UpdateBonusDto } from './dto/update-bonus.dto';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
  ) {}

  async findAll(query?: { employeeId?: number; type?: string; payrollPeriodId?: number; page?: number; limit?: number }): Promise<{ data: Bonus[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const where: any = {};

    if (query?.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query?.type) {
      where.type = query.type;
    }
    if (query?.payrollPeriodId) {
      where.payrollPeriodId = query.payrollPeriodId;
    }

    const [data, total] = await this.bonusRepository.findAndCount({
      where,
      relations: { employee: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Bonus> {
    const bonus = await this.bonusRepository.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!bonus) {
      throw new NotFoundException(`Bonus with id ${id} not found`);
    }
    return bonus;
  }

  async create(dto: CreateBonusDto): Promise<Bonus> {
    const bonus = this.bonusRepository.create(dto as any);
    return this.bonusRepository.save(bonus) as unknown as Bonus;
  }

  async update(id: number, dto: UpdateBonusDto): Promise<Bonus> {
    const bonus = await this.findById(id);
    Object.assign(bonus, dto);
    return this.bonusRepository.save(bonus) as unknown as Bonus;
  }

  async delete(id: number): Promise<void> {
    const bonus = await this.findById(id);
    await this.bonusRepository.remove(bonus);
  }
}

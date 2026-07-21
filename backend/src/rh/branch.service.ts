import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll(query?: { search?: string; page?: number; limit?: number }): Promise<{ data: Branch[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;

    const where: any = { isActive: true };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.branchRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with id ${id} not found`);
    }
    return branch;
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create(dto as any);
    return this.branchRepository.save(branch) as unknown as Branch;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findById(id);
    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async delete(id: number): Promise<void> {
    const branch = await this.findById(id);
    branch.isActive = false;
    await this.branchRepository.save(branch);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async findAll(query?: { search?: string; page?: number; limit?: number }): Promise<{ data: Department[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;

    const where: any = { isActive: true };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.departmentRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findAllSimple(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: { employees: true },
    });
    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(dto as any);
    return this.departmentRepository.save(department) as unknown as Department;
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findById(id);
    Object.assign(department, dto);
    return this.departmentRepository.save(department);
  }

  async delete(id: number): Promise<void> {
    const department = await this.findById(id);

    const employeeCount = await this.departmentRepository
      .createQueryBuilder('dept')
      .relation('employees')
      .of(id)
      .loadMany();

    if (employeeCount.length > 0) {
      throw new BadRequestException('Cannot delete department with active employees');
    }

    department.isActive = false;
    await this.departmentRepository.save(department);
  }
}

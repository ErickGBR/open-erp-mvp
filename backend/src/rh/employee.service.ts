import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, FindOptionsWhere, FindOperator } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(query?: { search?: string; page?: number; limit?: number; departmentId?: number; status?: string }): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;

    const baseWhere: FindOptionsWhere<Employee> = { isActive: true };

    if (query?.departmentId) {
      baseWhere.departmentId = query.departmentId;
    }
    if (query?.status) {
      baseWhere.status = query.status;
    }

    let where: FindOptionsWhere<Employee> | FindOptionsWhere<Employee>[] = baseWhere;

    if (search) {
      where = [
        { ...baseWhere, firstName: ILike(`%${search}%`) },
        { ...baseWhere, lastName: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.employeeRepository.findAndCount({
      where,
      relations: { department: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findAllFlat(): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { isActive: true },
      relations: { department: true },
      order: { id: 'DESC' },
      take: 1000,
    });
  }

  async findById(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async findByCode(code: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { code } });
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    await this.assertUniqueField('code', dto.code);
    if (dto.dui) await this.assertUniqueField('dui', dto.dui);
    if (dto.nit) await this.assertUniqueField('nit', dto.nit);

    const employee = this.employeeRepository.create(this.mapCreateDto(dto));
    return this.employeeRepository.save(employee);
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findById(id);

    if (dto.code && dto.code !== employee.code) {
      await this.assertUniqueField('code', dto.code, id);
    }
    if (dto.dui && dto.dui !== employee.dui) {
      await this.assertUniqueField('dui', dto.dui, id);
    }
    if (dto.nit && dto.nit !== employee.nit) {
      await this.assertUniqueField('nit', dto.nit, id);
    }

    Object.assign(employee, dto);
    return this.employeeRepository.save(employee);
  }

  async delete(id: number): Promise<void> {
    const employee = await this.findById(id);
    employee.isActive = false;
    await this.employeeRepository.save(employee);
  }

  private async assertUniqueField(
    field: 'code' | 'dui' | 'nit',
    value: string,
    excludeId?: number,
  ): Promise<void> {
    const condition: Record<string, string | FindOperator<number>> = { [field]: value };
    if (excludeId) {
      condition.id = Not(excludeId);
    }
    const existing = await this.employeeRepository.findOne({ where: condition as FindOptionsWhere<Employee> });
    if (existing) {
      const label = field === 'code' ? 'Code' : field.toUpperCase();
      throw new BadRequestException(`Employee with ${label} ${value} already exists`);
    }
  }

  private mapCreateDto(dto: CreateEmployeeDto): Partial<Employee> {
    return {
      code: dto.code,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dui: dto.dui,
      nit: dto.nit,
      nrc: dto.nrc ?? null,
      email: dto.email,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      hireDate: dto.hireDate,
      position: dto.position ?? null,
      salaryType: dto.salaryType ?? 'monthly',
      baseSalary: dto.baseSalary ?? 0,
      bankName: dto.bankName ?? null,
      bankAccount: dto.bankAccount ?? null,
      isssNumber: dto.isssNumber ?? null,
      afpNumber: dto.afpNumber ?? null,
      status: dto.status ?? 'active',
      isActive: dto.isActive ?? true,
      departmentId: dto.departmentId ?? null,
    };
  }
}

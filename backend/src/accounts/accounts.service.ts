import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async findAll(query?: { search?: string; type?: string }): Promise<Account[]> {
    const where: any = { isActive: true };

    if (query?.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query?.type) {
      where.type = query.type;
    }

    return this.accountsRepository.find({
      where,
      order: { code: 'ASC' },
      relations: { parent: true },
    });
  }

  async findById(id: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: { parent: true },
    });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return account;
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.accountsRepository.findOne({ where: { code } });
  }

  async create(dto: CreateAccountDto): Promise<Account> {
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new BadRequestException(`Account with code ${dto.code} already exists`);
    }

    if (dto.parentId) {
      const parent = await this.accountsRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException(`Parent account with id ${dto.parentId} not found`);
      }
    }

    const account = this.accountsRepository.create(dto as any);
    const saved = await this.accountsRepository.save(account);
    return saved as unknown as Account;
  }

  async update(id: number, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findById(id);

    if (dto.code && dto.code !== account.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new BadRequestException(`Account with code ${dto.code} already exists`);
      }
    }

    if (dto.parentId && dto.parentId !== account.parentId) {
      const parent = await this.accountsRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException(`Parent account with id ${dto.parentId} not found`);
      }
    }

    Object.assign(account, dto);
    return this.accountsRepository.save(account);
  }

  async delete(id: number): Promise<void> {
    const account = await this.findById(id);

    const children = await this.accountsRepository.count({ where: { parentId: id, isActive: true } });
    if (children > 0) {
      throw new BadRequestException('Cannot delete account with active child accounts');
    }

    account.isActive = false;
    await this.accountsRepository.save(account);
  }

  async getChartTree(): Promise<Account[]> {
    const accounts = await this.accountsRepository.find({
      where: { isActive: true },
      order: { code: 'ASC' },
      relations: { parent: true },
    });
    return accounts;
  }
}

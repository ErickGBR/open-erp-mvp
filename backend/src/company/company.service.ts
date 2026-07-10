import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async getSettings(): Promise<Company> {
    let company = await this.companyRepo.findOne({ where: {} });
    if (!company) {
      company = this.companyRepo.create({ name: 'My Company' });
      company = await this.companyRepo.save(company) as unknown as Company;
    }
    return company;
  }

  async updateSettings(dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.getSettings();
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async getNextInvoiceNumber(): Promise<string> {
    const company = await this.getSettings();
    const num = company.nextInvoiceNumber;
    company.nextInvoiceNumber += 1;
    await this.companyRepo.save(company);
    // Format: F-001-00000001
    const npe = company.npe || '001';
    return `F-${npe}-${String(num).padStart(8, '0')}`;
  }
}

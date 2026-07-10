import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateCompanyDto) {
    return this.service.updateSettings(dto);
  }
}

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { BonusService } from './bonus.service';
import { CreateBonusDto } from './dto/create-bonus.dto';
import { UpdateBonusDto } from './dto/update-bonus.dto';

@Controller('rh/bonuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('type') type?: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bonusService.findAll({
      employeeId: employeeId ? parseInt(employeeId, 10) : undefined,
      type,
      payrollPeriodId: payrollPeriodId ? parseInt(payrollPeriodId, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateBonusDto) {
    return this.bonusService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBonusDto) {
    return this.bonusService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.delete(id);
  }
}

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShiftAssignmentService } from './shift-assignment.service';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';

@Controller('rh/assignments')
@UseGuards(JwtAuthGuard)
export class ShiftAssignmentController {
  constructor(private readonly shiftAssignmentService: ShiftAssignmentService) {}

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('branchId') branchId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shiftAssignmentService.findAll({
      employeeId: employeeId ? parseInt(employeeId, 10) : undefined,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      shiftId: shiftId ? parseInt(shiftId, 10) : undefined,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.shiftAssignmentService.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.shiftAssignmentService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateShiftAssignmentDto) {
    return this.shiftAssignmentService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShiftAssignmentDto) {
    return this.shiftAssignmentService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.shiftAssignmentService.delete(id);
  }
}

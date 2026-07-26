import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  // Warehouses
  @Get('warehouses')
  findAllWarehouses() {
    return this.service.findAllWarehouses();
  }

  @Get('warehouses/tree')
  getWarehouseTree() {
    return this.service.getTree();
  }

  @Get('warehouses/:id')
  findWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.service.findWarehouseById(id);
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.service.createWarehouse(dto);
  }

  @Patch('warehouses/:id')
  updateWarehouse(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    return this.service.updateWarehouse(id, dto);
  }

  @Delete('warehouses/:id')
  deleteWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteWarehouse(id);
  }

  // Locations
  @Get('warehouses/:id/locations')
  findLocations(@Param('id', ParseIntPipe) id: number) {
    return this.service.findLocationsByWarehouse(id);
  }

  @Post('warehouse-locations')
  createLocation(@Body() dto: CreateLocationDto) {
    return this.service.createLocation(dto);
  }

  @Delete('warehouse-locations/:id')
  deleteLocation(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLocation(id);
  }

  // Product stock by location
  @Get('products/:id/stock-locations')
  getProductStock(@Param('id', ParseIntPipe) id: number) {
    return this.service.getStockByProduct(id);
  }

  @Post('products/:id/stock-locations')
  setProductStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) {
    return this.service.setStock(id, dto);
  }
}

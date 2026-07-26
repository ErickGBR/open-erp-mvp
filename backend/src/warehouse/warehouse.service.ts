import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseLocation } from './warehouse-location.entity';
import { ProductStock } from './product-stock.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { WarehouseTreeItemDto, WarehouseTreeResponseDto } from './dto/warehouse-tree.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseLocation)
    private readonly locationRepo: Repository<WarehouseLocation>,
    @InjectRepository(ProductStock)
    private readonly stockRepo: Repository<ProductStock>,
  ) {}

  // --- Warehouses ---
  async findAllWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepo.find({ where: { isActive: true }, relations: { locations: true } });
  }

  async getTree(): Promise<WarehouseTreeResponseDto> {
    const warehouses = await this.warehouseRepo.find({
      where: { isActive: true },
      relations: { locations: true },
    });
    const data = warehouses.map(WarehouseTreeItemDto.fromEntity);
    return { data };
  }

  async findWarehouseById(id: number): Promise<Warehouse> {
    const wh = await this.warehouseRepo.findOne({ where: { id }, relations: { locations: true } });
    if (!wh) throw new NotFoundException(`Warehouse ${id} not found`);
    return wh;
  }

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    const wh = this.warehouseRepo.create(dto as any);
    const saved = await this.warehouseRepo.save(wh);
    return saved as unknown as Warehouse;
  }

  async updateWarehouse(id: number, dto: Partial<CreateWarehouseDto>): Promise<Warehouse> {
    const wh = await this.findWarehouseById(id);
    Object.assign(wh, dto);
    return this.warehouseRepo.save(wh);
  }

  async deleteWarehouse(id: number): Promise<void> {
    const wh = await this.findWarehouseById(id);
    wh.isActive = false;
    await this.warehouseRepo.save(wh);
  }

  // --- Locations ---
  async findLocationsByWarehouse(warehouseId: number): Promise<WarehouseLocation[]> {
    return this.locationRepo.find({ where: { warehouseId, isActive: true } });
  }

  async createLocation(dto: CreateLocationDto): Promise<WarehouseLocation> {
    const loc = this.locationRepo.create(dto as any);
    const saved = await this.locationRepo.save(loc);
    return saved as unknown as WarehouseLocation;
  }

  async deleteLocation(id: number): Promise<void> {
    const loc = await this.locationRepo.findOne({ where: { id } });
    if (!loc) throw new NotFoundException(`Location ${id} not found`);
    loc.isActive = false;
    await this.locationRepo.save(loc);
  }

  // --- Product Stock ---
  async getStockByProduct(productId: number): Promise<ProductStock[]> {
    return this.stockRepo.find({
      where: { productId },
      relations: { location: { warehouse: true } },
    });
  }

  async setStock(productId: number, dto: UpdateStockDto): Promise<ProductStock> {
    const existing = await this.stockRepo.findOne({
      where: { productId, locationId: dto.locationId },
    });
    if (existing) {
      existing.quantity = dto.quantity;
      return this.stockRepo.save(existing);
    }
    const stock = this.stockRepo.create({ productId, locationId: dto.locationId, quantity: dto.quantity });
    const saved = await this.stockRepo.save(stock);
    return saved as unknown as ProductStock;
  }
}

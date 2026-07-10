import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { KardexService } from '../kardex/kardex.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @Inject(forwardRef(() => KardexService))
    private readonly kardexService: KardexService,
  ) {}

  async findAll(query?: { search?: string; page?: number; limit?: number; category?: string }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;

    const where: any = { isActive: true };

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (query?.category) {
      where.category = query.category;
    }

    const [data, total] = await this.productsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto as any);
    const [saved] = await this.productsRepository.save(product);

    // Record initial kardex entry if initial stock > 0
    if ((dto.stock ?? 0) > 0 || (dto.cost ?? 0) > 0) {
      const initialStock = dto.stock ?? 0;
      const cost = dto.cost ?? 0;
      await this.kardexService.record({
        productId: saved.id,
        type: 'entry',
        quantity: initialStock,
        unitCost: cost || 0,
        referenceType: 'initial',
        previousStock: 0,
        newStock: initialStock,
        previousAvgCost: 0,
        newAvgCost: cost || 0,
        notes: 'Initial stock',
      });
    }

    return saved;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }

  async delete(id: number): Promise<void> {
    const product = await this.findById(id);
    product.isActive = false;
    await this.productsRepository.save(product);
  }

  async updateStock(id: number, dto: UpdateStockDto): Promise<Product> {
    const product = await this.findById(id);
    const newStock = product.stock + dto.quantity;
    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${product.stock}, requested change: ${dto.quantity}`,
      );
    }

    const isEntry = dto.quantity > 0;
    const currentAvgCost = await this.kardexService.getCurrentAvgCost(id);
    const unitCost = dto.unitCost ?? (isEntry ? (dto.cost ?? currentAvgCost) : currentAvgCost);
    const totalValue = product.stock * currentAvgCost;
    const entryValue = isEntry ? dto.quantity * unitCost : 0;
    const newAvgCost = isEntry && (product.stock + dto.quantity) > 0
      ? (totalValue + entryValue) / (product.stock + dto.quantity)
      : currentAvgCost;

    product.stock = newStock;
    const saved = await this.productsRepository.save(product);

    await this.kardexService.record({
      productId: id,
      type: isEntry ? 'entry' : 'exit',
      quantity: Math.abs(dto.quantity),
      unitCost,
      referenceType: dto.referenceType ?? 'adjustment',
      referenceId: dto.referenceId ?? null,
      previousStock: product.stock - dto.quantity,
      newStock: product.stock,
      previousAvgCost: currentAvgCost,
      newAvgCost,
      notes: dto.notes ?? null,
    });

    return saved;
  }
}

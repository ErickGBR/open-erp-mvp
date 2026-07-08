import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(query?: { search?: string; page?: number; limit?: number }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;

    const where: any = { isActive: true };

    if (search) {
      where.name = Like(`%${search}%`);
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
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
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
    product.stock = newStock;
    return this.productsRepository.save(product);
  }
}

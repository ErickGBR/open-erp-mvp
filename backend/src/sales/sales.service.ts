import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async findAll(query?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Sale[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = query?.search;
    const status = query?.status;

    const qb = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('sale.createdAt', 'DESC');

    if (status) {
      qb.andWhere('sale.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(sale.invoiceNumber LIKE :search OR customer.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<Sale> {
    const sale = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('sale.id = :id', { id })
      .getOne();

    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
    return sale;
  }

  async create(dto: CreateSaleDto): Promise<Sale> {
    const invoiceNumber = await this.generateInvoiceNumber();

    let subtotal = 0;
    for (const item of dto.items) {
      subtotal += item.price * item.quantity;
    }
    const tax = 0; // MVP: flat 0% tax — no complex tax regimes
    const total = subtotal + tax;

    const sale = this.salesRepository.create({
      invoiceNumber,
      customerId: dto.customerId ?? null,
      subtotal,
      tax,
      total,
      notes: dto.notes ?? null,
      status: 'pending',
    });

    const savedSale = await this.salesRepository.save(sale);

    const saleItems: SaleItem[] = [];
    for (const itemDto of dto.items) {
      const product = await this.productsService.findById(itemDto.productId);

      const saleItem = this.saleItemsRepository.create({
        saleId: savedSale.id,
        productId: itemDto.productId,
        productName: product.name,
        price: itemDto.price,
        quantity: itemDto.quantity,
        total: itemDto.price * itemDto.quantity,
      });
      saleItems.push(saleItem);

      await this.productsService.updateStock(itemDto.productId, {
        quantity: -itemDto.quantity,
        unitCost: itemDto.price,
        referenceType: 'sale',
        referenceId: savedSale.id,
      });
    }

    await this.saleItemsRepository.save(saleItems);

    return this.findById(savedSale.id);
  }

  async updateStatus(id: number, status: string): Promise<Sale> {
    const sale = await this.findById(id);

    if (sale.status === 'cancelled') {
      throw new BadRequestException('Sale is already cancelled');
    }

    if (status === 'cancelled') {
      for (const item of sale.items) {
        await this.productsService.updateStock(item.productId, {
          quantity: item.quantity,
          referenceType: 'adjustment',
          referenceId: sale.id,
          notes: 'Sale cancelled — stock restored',
        });
      }
    }

    sale.status = status;
    if (status === 'paid') {
      sale.paidAt = new Date();
    }

    return this.salesRepository.save(sale);
  }

  async delete(id: number): Promise<void> {
    const sale = await this.findById(id);

    if (sale.status !== 'cancelled') {
      for (const item of sale.items) {
        await this.productsService.updateStock(item.productId, {
          quantity: item.quantity,
          referenceType: 'adjustment',
          referenceId: sale.id,
          notes: 'Sale deleted — stock restored',
        });
      }
    }

    await this.salesRepository.remove(sale);
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;

    const startOfDay = new Date(y, now.getMonth(), now.getDate());

    const count = await this.salesRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfDay),
      },
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `INV-${dateStr}-${sequential}`;
  }
}

import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';
import { CompanyService } from '../company/company.service';
import * as crypto from 'crypto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly companyService: CompanyService,
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
    const invoiceNumber = await this.companyService.getNextInvoiceNumber();

    let subtotal = 0;
    for (const item of dto.items) {
      subtotal += item.price * item.quantity;
    }
    const taxRate = 13; // IVA 13%
    const tax = +(subtotal * taxRate / 100).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    // Generate DTE data
    const generationCode = crypto.randomUUID();
    const company = await this.companyService.getSettings();

    // Build QR data string
    const qrData = JSON.stringify({
      nit: company.nit,
      nrc: company.nrc,
      invoice: invoiceNumber,
      generationCode,
      date: new Date().toISOString(),
      subtotal,
      tax,
      total,
      receiverNit: dto.receiverNit || null,
      receiverName: dto.receiverName || null,
    });

    const sale = this.salesRepository.create({
      invoiceNumber,
      dteType: '01',
      generationCode,
      receiverNit: dto.receiverNit || null,
      receiverNrc: dto.receiverNrc || null,
      receiverName: dto.receiverName || null,
      receiverAddress: dto.receiverAddress || null,
      receiverPhone: dto.receiverPhone || null,
      receiverEmail: dto.receiverEmail || null,
      qrData,
      customerId: dto.customerId ?? null,
      subtotal,
      tax,
      total,
      notes: dto.notes ?? null,
      status: 'paid',
      paidAt: new Date(),
    });

    const savedSale = await this.salesRepository.save(sale) as unknown as Sale;

    const saleItems: SaleItem[] = [];
    for (const itemDto of dto.items) {
      const product = await this.productsService.findById(itemDto.productId);

      const saleItem = this.saleItemsRepository.create({
        saleId: savedSale.id,
        productId: itemDto.productId,
        productName: product.name,
        price: itemDto.price,
        quantity: itemDto.quantity,
        total: +(itemDto.price * itemDto.quantity).toFixed(2),
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
}

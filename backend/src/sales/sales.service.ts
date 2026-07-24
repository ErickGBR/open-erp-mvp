import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
      .where('sale.isActive = :isActive', { isActive: true })
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoiceNumber = await this.companyService.getNextInvoiceNumber();

      let subtotal = 0;
      for (const item of dto.items) {
        subtotal += item.price * item.quantity;
      }

      const company = await this.companyService.getSettings();
      const taxRate = company.taxRate ?? 13;
      const tax = +(subtotal * taxRate / 100).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      // Generate DTE data
      const generationCode = crypto.randomUUID();

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

      const sale = queryRunner.manager.create(Sale, {
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
        isActive: true,
      });

      const savedSale = await queryRunner.manager.save(sale);

      const saleItems: SaleItem[] = [];
      const stockUpdates = dto.items.map(async (itemDto) => {
        const product = await this.productsService.findById(itemDto.productId);

        const saleItem = queryRunner.manager.create(SaleItem, {
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
          unitCost: product.cost,
          referenceType: 'sale',
          referenceId: savedSale.id,
        });
      });

      await Promise.all(stockUpdates);
      await queryRunner.manager.save(saleItems);

      await queryRunner.commitTransaction();

      return this.findById(savedSale.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, status: string): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.findById(id);

      if (sale.status === 'cancelled') {
        throw new BadRequestException('Sale is already cancelled');
      }

      if (status === 'cancelled') {
        const stockRestores = sale.items.map(async (item) => {
          await this.productsService.updateStock(item.productId, {
            quantity: item.quantity,
            referenceType: 'adjustment',
            referenceId: sale.id,
            notes: 'Sale cancelled — stock restored',
          });
        });
        await Promise.all(stockRestores);
      }

      sale.status = status;
      if (status === 'paid') {
        sale.paidAt = new Date();
      }

      await queryRunner.manager.save(sale);
      await queryRunner.commitTransaction();

      return this.findById(sale.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.findById(id);

      if (sale.status !== 'cancelled') {
        const stockRestores = sale.items.map(async (item) => {
          await this.productsService.updateStock(item.productId, {
            quantity: item.quantity,
            referenceType: 'adjustment',
            referenceId: sale.id,
            notes: 'Sale deleted — stock restored',
          });
        });
        await Promise.all(stockRestores);
      }

      // Soft delete — mark as inactive
      sale.isActive = false;
      await queryRunner.manager.save(sale);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
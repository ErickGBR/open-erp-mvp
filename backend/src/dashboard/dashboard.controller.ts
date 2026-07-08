import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Sale } from '../sales/sale.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) {}

  @Get('stats')
  async getStats() {
    const [totalProducts, activeProducts, totalCustomers, salesResult, recentSales] = await Promise.all([
      this.productRepo.count(),
      this.productRepo.count({ where: { isActive: true } }),
      this.customerRepo.count({ where: { isActive: true } }),
      this.saleRepo
        .createQueryBuilder('sale')
        .select('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(sale.total), 0)', 'revenue')
        .addSelect(`COALESCE(SUM(CASE WHEN sale.status = 'paid' THEN sale.total ELSE 0 END), 0)`, 'paidRevenue')
        .getRawOne(),
      this.saleRepo
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.customer', 'customer')
        .orderBy('sale.createdAt', 'DESC')
        .take(5)
        .getMany(),
    ]);

    return {
      totalProducts,
      activeProducts,
      totalCustomers,
      totalSales: Number(salesResult?.count || 0),
      totalRevenue: Number(salesResult?.revenue || 0),
      paidRevenue: Number(salesResult?.paidRevenue || 0),
      recentSales: recentSales.map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        customer: s.customer?.name || 'Walk-in',
        total: s.total,
        status: s.status,
        createdAt: s.createdAt,
      })),
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Sale } from '../sales/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, Sale])],
  controllers: [DashboardController],
})
export class DashboardModule {}

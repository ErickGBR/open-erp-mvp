import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { WarehouseLocation } from './warehouse-location.entity';

@Entity('product_stocks')
export class ProductStock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, p => p.stocks)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'int' })
  locationId!: number;

  @ManyToOne(() => WarehouseLocation, loc => loc.stocks)
  @JoinColumn({ name: 'locationId' })
  location!: WarehouseLocation;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

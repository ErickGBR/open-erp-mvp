import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductStock } from '../warehouse/product-stock.entity';

export type UnitOfMeasure = 'unit' | 'dozen' | 'kg' | 'lb' | 'ft' | 'inch' | 'm' | 'cm' | 'l' | 'ml' | 'box' | 'pack';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku!: string;

  /** EAN-8 barcode */
  @Column({ type: 'varchar', length: 13, nullable: true })
  barcode!: string | null;

  /** Product image URL */
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  /** Unit of measure */
  @Column({ type: 'varchar', length: 20, default: 'unit' })
  unitOfMeasure!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => ProductStock, ps => ps.product)
  stocks!: ProductStock[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

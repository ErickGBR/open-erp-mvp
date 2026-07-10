import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';

export type KardexType = 'entry' | 'exit' | 'adjustment';
export type KardexReference = 'purchase' | 'sale' | 'adjustment' | 'initial';

@Entity('kardex_entries')
export class KardexEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 15 })
  type!: KardexType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitCost!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalCost!: number;

  @Column({ type: 'varchar', length: 20 })
  referenceType!: KardexReference;

  @Column({ nullable: true })
  referenceId!: number | null;

  @Column({ type: 'int', default: 0 })
  previousStock!: number;

  @Column({ type: 'int', default: 0 })
  newStock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previousAvgCost!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  newAvgCost!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

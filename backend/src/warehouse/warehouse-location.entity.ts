import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { ProductStock } from './product-stock.entity';

@Entity('warehouse_locations')
export class WarehouseLocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  warehouseId!: number;

  @ManyToOne(() => Warehouse, wh => wh.locations)
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  /** Shelf / rack name */
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /** Shelf section */
  @Column({ type: 'varchar', length: 100, nullable: true })
  section!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => ProductStock, ps => ps.location)
  stocks!: ProductStock[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

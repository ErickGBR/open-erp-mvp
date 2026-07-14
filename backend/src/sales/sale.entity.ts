import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 20 })
  invoiceNumber!: string;

  // --- DTE fields ---
  @Column({ type: 'varchar', length: 50, nullable: true })
  dteType!: string | null;       // '01' = Electronic Invoice

  @Column({ type: 'varchar', length: 50, nullable: true })
  generationCode!: string | null; // UUID v4

  @Column({ type: 'varchar', length: 20, nullable: true })
  receiverNit!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  receiverNrc!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  receiverName!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  receiverAddress!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  receiverPhone!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  receiverEmail!: string | null;

  @Column({ type: 'text', nullable: true })
  qrData!: string | null;        // DTE data encoded for QR

  // --- Standard fields ---
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer | null;

  @Column({ type: 'int', nullable: true })
  customerId!: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @OneToMany(() => SaleItem, item => item.sale, { cascade: true, eager: true })
  items!: SaleItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

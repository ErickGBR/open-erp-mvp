import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_settings')
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nit!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nrc!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  npe!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  commercialName!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  economicActivity!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'USD' })
  currency!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 13.00 })
  taxRate!: number;

  @Column({ type: 'int', default: 1 })
  nextInvoiceNumber!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';
export type AccountSubType =
  | 'current_asset' | 'fixed_asset' | 'other_asset'
  | 'current_liability' | 'long_term_liability'
  | 'capital' | 'retained_earnings'
  | 'operating_income' | 'other_income'
  | 'operating_expense' | 'administrative_expense' | 'other_expense';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: AccountType;

  @Column({ type: 'varchar', length: 30, nullable: true })
  subType!: AccountSubType | null;

  @Column({ type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent!: Account | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

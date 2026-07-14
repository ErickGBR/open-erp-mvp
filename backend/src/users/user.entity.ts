import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ROOT = 'root',
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', unique: true, length: 150 })
  email!: string;

  /** Nullable for OAuth users who don't set a password. */
  @Column({ type: 'varchar', length: 200, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.ADMIN })
  role!: UserRole;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language!: string;

  /** Google OAuth identifier. Unique when present. */
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId?: string;

  /** Microsoft OAuth identifier — unique when present. */
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  microsoftId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

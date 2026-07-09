import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  /** Nullable for OAuth users who don't set a password. */
  @Column({ nullable: true })
  password?: string;

  @Column({ default: 'admin' })
  role!: string;

  /** Google OAuth identifier. Unique when present. */
  @Column({ nullable: true, unique: true })
  googleId?: string;

  /** Microsoft OAuth identifier — unique when present. */
  @Column({ nullable: true, unique: true })
  microsoftId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

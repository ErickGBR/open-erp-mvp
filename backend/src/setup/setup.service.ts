import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class SetupService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Check whether the initial system setup has been completed.
   * Setup is complete when at least one root-level user exists.
   *
   * @returns an object with `setupComplete` and `hasRootUser` booleans
   */
  async getStatus(): Promise<{ setupComplete: boolean; hasRootUser: boolean }> {
    const rootUser = await this.usersRepository.findOne({ where: { role: UserRole.ROOT } });
    return {
      setupComplete: !!rootUser,
      hasRootUser: !!rootUser,
    };
  }

  /**
   * Bootstrap the system by creating the very first root user.
   * This method may only be called ONCE — when no root user exists yet.
   *
   * @param data — name, email, password, and optional organization name
   * @returns a JWT access_token together with the new root user profile
   * @throws ConflictException if a root user already exists or the email is taken
   */
  async initRootUser(data: {
    name: string;
    email: string;
    password: string;
    orgName?: string;
    usageMode?: string;
  }) {
    const existing = await this.usersRepository.findOne({ where: { role: UserRole.ROOT } });
    if (existing) {
      throw new ConflictException('Root user already exists. Setup is complete.');
    }

    const existingEmail = await this.usersRepository.findOne({ where: { email: data.email } });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.ROOT,
      status: 'active' as any,
    });
    await this.usersRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

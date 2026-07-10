import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Find a user by their email address.
   * @param email — the email to look up
   * @returns the matching user or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by their primary key.
   * @param id — user id
   * @throws NotFoundException when the user does not exist
   */
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Find a user by their Google OAuth identifier.
   * @param googleId — the Google id from the OAuth profile
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  /**
   * Find a user by their Microsoft OAuth identifier.
   * @param microsoftId — the Microsoft id from the OAuth profile
   */
  async findByMicrosoftId(microsoftId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { microsoftId } });
  }

  /**
   * Create a new user originating from an OAuth provider.
   * @param data — name, email, and optional provider ids
   */
  async createOAuthUser(data: {
    name: string;
    email: string;
    googleId?: string;
    microsoftId?: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  /**
   * Associate a Google OAuth id with an existing user.
   * @param userId — the user's primary key
   * @param googleId — the Google id to link
   */
  async updateGoogleId(userId: number, googleId: string): Promise<void> {
    await this.usersRepository.update(userId, { googleId });
  }

  /**
   * Associate a Microsoft OAuth id with an existing user.
   * @param userId — the user's primary key
   * @param microsoftId — the Microsoft id to link
   */
  async updateMicrosoftId(userId: number, microsoftId: string): Promise<void> {
    await this.usersRepository.update(userId, { microsoftId });
  }

  /**
   * Persist a new user with the given attributes.
   * @param data — partial user attributes to save
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  /**
   * Retrieve all users with a safe subset of fields.
   * @returns array of users (id, name, email, role, status, createdAt)
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create a user on behalf of the root administrator.
   * Root users themselves cannot be created through this method.
   *
   * @param data — name, email, password, and optional role
   * @returns the persisted user
   * @throws ConflictException if the email is already taken
   */
  async createByRoot(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    return this.usersRepository.save(user);
  }

  /**
   * Update a user's role or status (root-only operation).
   *
   * @param id   — user primary key
   * @param data — fields to update (role, status)
   * @returns the updated user
   * @throws NotFoundException if the user does not exist
   * @throws ForbiddenException if the target user is a root user
   */
  async updateByRoot(
    id: number,
    data: { role?: UserRole; status?: UserStatus },
  ): Promise<User> {
    const user = await this.findById(id);

    if (user.role === UserRole.ROOT) {
      throw new ForbiddenException('Cannot modify root user');
    }

    if (data.role) user.role = data.role;
    if (data.status) user.status = data.status;

    return this.usersRepository.save(user);
  }

  /**
   * Soft-delete a user by setting their status to inactive.
   *
   * @param id — user primary key
   * @throws NotFoundException if the user does not exist
   * @throws ForbiddenException if the target user is a root user
   */
  async deactivate(id: number): Promise<User> {
    const user = await this.findById(id);

    if (user.role === UserRole.ROOT) {
      throw new ForbiddenException('Cannot deactivate root user');
    }

    user.status = UserStatus.INACTIVE;
    return this.usersRepository.save(user);
  }
}

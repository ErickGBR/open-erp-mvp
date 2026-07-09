import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }
}

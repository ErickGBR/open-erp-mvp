import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language || 'en',
      },
    };
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language || 'en',
      },
    };
  }

  /**
   * Validate an OAuth user profile and return a signed JWT.
   *
   * If the provider id matches an existing user, a fresh token is issued.
   * If the email matches an existing user (without that provider id), the
   * provider id is linked to that account.
   * Otherwise a new user is created from the profile data.
   *
   * @param profile — the OAuth profile from the external provider
   * @returns an object with the JWT access_token and serialised user
   */
  async validateOAuthUser(profile: {
    id: string;
    email: string;
    name: string;
    provider: 'google' | 'microsoft';
  }) {
    const { id, email, name, provider } = profile;

    // 1 — try to find the user by their provider-specific id
    const finder =
      provider === 'google'
        ? this.usersService.findByGoogleId(id)
        : this.usersService.findByMicrosoftId(id);

    let user = await finder;

    if (user) {
      // Existing OAuth user — issue a fresh token
      return this.buildAuthResponse(user);
    }

    // 2 — check if a user with this email already exists (local account)
    user = await this.usersService.findByEmail(email);

    if (user) {
      // Link the provider id to the existing account
      if (provider === 'google') {
        await this.usersService.updateGoogleId(user.id, id);
      } else {
        await this.usersService.updateMicrosoftId(user.id, id);
      }
      return this.buildAuthResponse(user);
    }

    // 3 — completely new user: create from OAuth profile
    const oauthData: {
      name: string;
      email: string;
      googleId?: string;
      microsoftId?: string;
    } =
      provider === 'google'
        ? { name, email, googleId: id }
        : { name, email, microsoftId: id };

    user = await this.usersService.createOAuthUser(oauthData);
    return this.buildAuthResponse(user);
  }

  /**
   * Build a standard auth response from a User entity.
   * @param user — the persisted user
   * @returns access_token and user payload (same shape as login / register)
   */
  private buildAuthResponse(user: {
    id: number;
    name: string;
    email: string;
    role: string;
    language?: string;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language || 'en',
      },
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { UserRole, UserStatus } from './user.entity';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

/** Validation DTO for root-initiated user creation. */
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['admin', 'user', 'viewer'])
  role?: UserRole;
}

/** Validation DTO for root-initiated user updates. */
export class UpdateUserDto {
  @IsOptional()
  @IsIn(['admin', 'user', 'viewer'])
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * List every user in the system.
   * Only root users can access this endpoint.
   */
  @Get()
  @Roles(UserRole.ROOT)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
  }

  /**
   * Create a new user (non-root) on behalf of the organisation.
   * Only root users can access this endpoint.
   *
   * @param dto — validated name, email, password, and optional role
   */
  @Post()
  @Roles(UserRole.ROOT)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.createByRoot(dto);
  }

  /**
   * Update a user's role or status.
   * Only root users can access this endpoint.
   *
   * @param id  — user primary key
   * @param dto — fields to update
   */
  @Patch(':id')
  @Roles(UserRole.ROOT)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateByRoot(id, {
      role: dto.role,
      status: dto.status as UserStatus | undefined,
    });
  }

  /**
   * Deactivate (soft-delete) a user by setting their status to inactive.
   * Only root users can access this endpoint.
   *
   * @param id — user primary key
   */
  @Delete(':id')
  @Roles(UserRole.ROOT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated' };
  }
}

import { Controller, Get, Patch, Body, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { IsOptional, IsIn } from 'class-validator';

class UpdateLanguageDto {
  @IsOptional()
  @IsIn(['en', 'es'])
  language?: string;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language || 'en',
    };
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() dto: UpdateLanguageDto) {
    const updated = await this.usersService.updateProfile(req.user.id, dto);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      language: updated.language || 'en',
    };
  }
}

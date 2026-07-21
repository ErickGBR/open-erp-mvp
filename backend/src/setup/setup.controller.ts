import { Controller, Get, Post, Body } from '@nestjs/common';
import { SetupService } from './setup.service';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

/** Validation DTO for the initial root-user creation request. */
export class InitRootDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  orgName?: string;

  @IsOptional()
  @IsString()
  usageMode?: string;
}

@Controller('setup')
export class SetupController {
  constructor(private setupService: SetupService) {}

  /**
   * Return the current setup status.
   * Public endpoint — no authentication required.
   */
  @Get('status')
  getStatus() {
    return this.setupService.getStatus();
  }

  /**
   * Initialise the system with the first root user.
   * Public endpoint — can only be called once.
   *
   * @param dto — validated name, email, password, and optional organisation name
   */
  @Post('init')
  initRoot(@Body() dto: InitRootDto) {
    return this.setupService.initRootUser(dto);
  }
}

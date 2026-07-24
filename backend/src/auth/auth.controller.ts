import { Controller, Post, Get, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  /**
   * Initiate Google OAuth flow.
   * Passport redirects the user to Google's consent screen.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Guard handles the redirect — no implementation needed
  }

  /**
   * Google OAuth callback.
   * Exchanges the authorisation code for a profile, then redirects
   * the frontend with the JWT as a query parameter.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: any, @Res() res: Response): void {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const { access_token } = req.user;
    res.redirect(`${frontendUrl}/auth#token=${access_token}`);
  }

  /**
   * Initiate Microsoft OAuth authentication.
   * Passport redirects the user to Microsoft's consent screen.
   */
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  microsoftAuth(): void {
    // Guard handles the redirect — no implementation needed
  }

  /**
   * Microsoft OAuth callback.
   * Exchanges the authorisation code for a profile, then redirects
   * the frontend with the JWT as a query parameter.
   */
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  microsoftCallback(@Req() req: any, @Res() res: Response): void {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const { access_token } = req.user;
    res.redirect(`${frontendUrl}/auth#token=${access_token}`);
  }
}

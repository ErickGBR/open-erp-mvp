import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { MicrosoftStrategy } from './microsoft.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : []),
    ...(process.env.MICROSOFT_CLIENT_ID ? [MicrosoftStrategy] : []),
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}

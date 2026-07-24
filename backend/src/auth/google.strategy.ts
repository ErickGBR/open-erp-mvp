import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-google-oauth20';

/**
 * Passport strategy for Google OAuth 2.0.
 *
 * Redirects users to Google for authentication, then uses the
 * returned profile to either find or create a local user via
 * AuthService.validateOAuthUser.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Called by Passport after Google returns the user profile.
   * @param accessToken — unused stored token from Google
   * @param refreshToken — unused refresh token
   * @param profile — the decoded Google profile (id, emails, name, …)
   * @param done — callback to pass the user back into the request pipeline
   */
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { id, name, emails } = profile;
      const email = emails?.[0]?.value;
      if (!email) {
        done(new Error('Google profile did not return an email'), undefined);
        return;
      }
      const result = await this.authService.validateOAuthUser({
        id,
        email,
        name: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
        provider: 'google',
      });
      done(null, result);
    } catch (err) {
      done(err instanceof Error ? err : new Error(String(err)), undefined);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-microsoft';

// VerifyFunction type from passport-oauth2 (re-exported internally by passport-microsoft)
type VerifyFunction = (
  err: Error | null,
  user?: unknown,
  info?: unknown,
) => void;

/**
 * Passport strategy for Microsoft (Entra / Azure AD) OAuth 2.0.
 *
 * Redirects users to Microsoft to authenticate, then uses the
 * returned profile to either find or create a local user via
 * AuthService.validateOAuthUser.
 */
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID')!,
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL')!,
      scope: ['user.read', 'openid', 'profile', 'email'],
      tenant: 'common',
    });
  }

  /**
   * Called by Passport after Microsoft returns the user profile.
   * @param accessToken — unused stored token from Microsoft
   * @param refreshToken — unused refresh token
   * @param profile — the decoded Microsoft profile (id, emails, displayName, …)
   * @param done — callback to pass the user back into the request pipeline
   */
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyFunction,
  ): Promise<void> {
    try {
      const { id, emails, displayName } = profile;
      const email = emails?.[0]?.value;
      if (!email) {
        done(new Error('Microsoft profile did not return an email'), undefined);
        return;
      }
      const result = await this.authService.validateOAuthUser({
        id,
        email,
        name: displayName ?? '',
        provider: 'microsoft',
      });
      done(null, result);
    } catch (err) {
      done(err instanceof Error ? err : new Error(String(err)), undefined);
    }
  }
}
/**
 * ========================================
 * 🌐 WEB OAUTH FLOW ONLY - NOT USED BY FLUTTER
 * ========================================
 *
 * This strategy handles Google OAuth for WEB applications with browser redirections.
 *
 * Used by routes:
 *   - GET  /admin/auth/google
 *   - GET  /admin/auth/google/callback
 *
 * ⚠️  FLUTTER DOES NOT USE THIS FILE
 *
 * Flutter uses instead:
 *   - POST /admin/auth/google/mobile
 *   - AuthService.authenticateWithGoogleToken()
 *
 * This file is kept for backend testing purposes and potential future web frontend.
 * ========================================
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthStrategy, SsoUserData } from './auth-strategy.interface';
import { AuthService } from '../auth.service';
import { AuthProviderType } from '../enums/auth-provider-type.enum';

@Injectable()
export class GoogleAuthStrategy
  extends PassportStrategy(Strategy, 'google')
  implements AuthStrategy
{
  provider = AuthProviderType.GOOGLE;

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const userData = this.extractUserInfo(profile);
    userData.accessToken = accessToken;
    userData.refreshToken = refreshToken;

    const user = await this.authService.findOrCreateUserFromSso(userData);
    done(null, user);
  }

  extractUserInfo(profile: Profile): SsoUserData {
    const email = profile.emails?.[0]?.value || '';
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';
    const profilePhoto = profile.photos?.[0]?.value;

    return {
      email,
      firstName,
      lastName,
      providerId: profile.id,
      provider: AuthProviderType.GOOGLE,
      profilePhoto,
    };
  }
}

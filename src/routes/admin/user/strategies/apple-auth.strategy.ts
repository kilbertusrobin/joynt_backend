/**
 * ========================================
 * 🌐 WEB OAUTH FLOW ONLY - NOT USED BY FLUTTER
 * ========================================
 *
 * This strategy handles Apple OAuth for WEB applications with browser redirections.
 *
 * Used by routes:
 *   - GET  /admin/auth/apple
 *   - POST /admin/auth/apple/callback
 *
 * ⚠️  FLUTTER DOES NOT USE THIS FILE
 *
 * Flutter uses instead:
 *   - POST /admin/auth/apple/mobile
 *   - AuthService.authenticateWithAppleToken()
 *
 * This file is kept for backend testing purposes and potential future web frontend.
 * ========================================
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-apple';
import { readFileSync } from 'fs';
import { AuthStrategy, SsoUserData } from './auth-strategy.interface';
import { AuthService } from '../auth.service';
import { AuthProviderType } from '../enums/auth-provider-type.enum';

@Injectable()
export class AppleAuthStrategy
  extends PassportStrategy(Strategy, 'apple')
  implements AuthStrategy
{
  provider = AuthProviderType.APPLE;

  constructor(private readonly authService: AuthService) {
    const privateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH || '';
    const privateKey = privateKeyPath
      ? readFileSync(privateKeyPath, 'utf8')
      : '';

    super({
      clientID: process.env.APPLE_CLIENT_ID || '',
      teamID: process.env.APPLE_TEAM_ID || '',
      keyID: process.env.APPLE_KEY_ID || '',
      privateKeyString: privateKey,
      callbackURL: process.env.APPLE_CALLBACK_URL || '',
      scope: ['name', 'email'],
    } as any);
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

  extractUserInfo(profile: any): SsoUserData {
    // Apple provides name only on first sign-in
    const email = profile.email;
    const firstName = profile.name?.firstName || '';
    const lastName = profile.name?.lastName || '';

    return {
      email,
      firstName,
      lastName,
      providerId: profile.id,
      provider: AuthProviderType.APPLE,
    };
  }
}

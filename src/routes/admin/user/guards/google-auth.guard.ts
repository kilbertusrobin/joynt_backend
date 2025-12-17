/**
 * ========================================
 * 🌐 WEB OAUTH FLOW ONLY - NOT USED BY FLUTTER
 * ========================================
 *
 * Guard for Google OAuth WEB routes with browser redirections.
 *
 * Used by routes:
 *   - GET  /admin/auth/google
 *   - GET  /admin/auth/google/callback
 *
 * ⚠️  FLUTTER DOES NOT USE THIS GUARD
 *
 * Flutter mobile route does not need this guard:
 *   - POST /admin/auth/google/mobile (uses ValidationPipe only)
 * ========================================
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

/**
 * ========================================
 * 🌐 WEB OAUTH FLOW ONLY - NOT USED BY FLUTTER
 * ========================================
 *
 * Guard for Apple OAuth WEB routes with browser redirections.
 *
 * Used by routes:
 *   - GET  /admin/auth/apple
 *   - POST /admin/auth/apple/callback
 *
 * ⚠️  FLUTTER DOES NOT USE THIS GUARD
 *
 * Flutter mobile route does not need this guard:
 *   - POST /admin/auth/apple/mobile (uses ValidationPipe only)
 * ========================================
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AppleAuthGuard extends AuthGuard('apple') {}

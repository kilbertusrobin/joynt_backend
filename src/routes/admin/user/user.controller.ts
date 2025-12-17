import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { GoogleAuthMobileDto } from './dtos/google-auth-mobile.dto';
import { AppleAuthMobileDto } from './dtos/apple-auth-mobile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';

@Controller('admin')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @Post('auth/login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }

  // ==========================================
  // 🌐 GOOGLE OAUTH - WEB ROUTES (NOT USED BY FLUTTER)
  // For backend testing only - Flutter uses /auth/google/mobile
  // ==========================================

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow (web only)
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user, token, isNewUser } = req.user as any;

    // 🧪 FOR TESTING: Return JSON instead of redirect (no frontend yet)
    // TODO: Uncomment redirect when Flutter is ready
    return res.json({ user, token, isNewUser, message: 'Google auth successful!' });

    // Redirect to frontend with token
    // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    // const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&isNewUser=${isNewUser}`;
    // res.redirect(redirectUrl);
  }

  // ==========================================
  // 📱 GOOGLE OAUTH - MOBILE ROUTE (FLUTTER)
  // ✅ Used by Flutter app
  // ==========================================

  @Post('auth/google/mobile')
  async googleAuthMobile(@Body(ValidationPipe) dto: GoogleAuthMobileDto) {
    return this.authService.authenticateWithGoogleToken(dto.idToken);
  }

  // ==========================================
  // 🌐 APPLE OAUTH - WEB ROUTES (NOT USED BY FLUTTER)
  // For backend testing only - Flutter uses /auth/apple/mobile
  // ==========================================
  @Get('auth/apple')
  @UseGuards(AppleAuthGuard)
  async appleAuth() {
    // Initiates Apple OAuth flow
  }

  @Post('auth/apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user, token, isNewUser } = req.user as any;

    // 🧪 FOR TESTING: Return JSON instead of redirect (no frontend yet)
    // TODO: Uncomment redirect when Flutter is ready
    return res.json({ user, token, isNewUser, message: 'Apple auth successful!' });

    // Redirect to frontend with token
    // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    // const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&isNewUser=${isNewUser}`;
    // res.redirect(redirectUrl);
  }

  // ==========================================
  // 📱 APPLE OAUTH - MOBILE ROUTE (FLUTTER)
  // ✅ Used by Flutter app
  // ==========================================

  @Post('auth/apple/mobile')
  async appleAuthMobile(@Body(ValidationPipe) dto: AppleAuthMobileDto) {
    return this.authService.authenticateWithAppleToken(dto.identityToken);
  }

  // ==========================================
  // 🔐 PROVIDER MANAGEMENT ROUTES
  // ✅ Used by Flutter app (and any client)
  // ==========================================
  @Get('users/:id/providers')
  @UseGuards(JwtAuthGuard)
  async getUserProviders(@Param('id') id: string) {
    const providers = await this.authService.getUserProviders(id);
    return { providers };
  }

  @Delete('users/:id/providers/:provider')
  @UseGuards(JwtAuthGuard)
  async unlinkProvider(
    @Param('id') id: string,
    @Param('provider') provider: string,
  ) {
    await this.authService.unlinkProvider(id, provider as any);
    return { message: 'Provider unlinked successfully' };
  }
}

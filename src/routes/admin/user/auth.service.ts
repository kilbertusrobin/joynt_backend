import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { SsoProvider } from './entities/sso-provider.entity';
import { SsoUserData } from './strategies/auth-strategy.interface';
import { UserMapper } from './mapper/user.mapper';
import { UserDto } from './dtos/user.dto';
import { AuthProviderType } from './enums/auth-provider-type.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(SsoProvider)
    private readonly ssoProviderRepository: Repository<SsoProvider>,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreateUserFromSso(
    userData: SsoUserData,
  ): Promise<{ user: UserDto; token: string; isNewUser: boolean }> {
    // 1. Check if provider already linked to a user
    const existingProvider = await this.ssoProviderRepository.findOne({
      where: {
        provider: userData.provider,
        providerId: userData.providerId,
      },
      relations: ['user', 'user.profile'],
    });

    if (existingProvider) {
      // Check if provider has a user (handle orphaned providers)
      if (!existingProvider.user) {
        // Delete orphaned provider and continue to create new account
        await this.ssoProviderRepository.remove(existingProvider);
      } else {
        // Update tokens
        await this.updateProviderTokens(existingProvider, userData);

        // Reload user with profile to get fresh data
        const user = await this.userRepository.findOne({
          where: { id: existingProvider.user.id },
          relations: ['profile'],
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        const userDto = UserMapper.toDto(user);
        const token = this.generateToken(user);
        return { user: userDto, token, isNewUser: false };
      }
    }

    // 2. Check if user exists with this email
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
      relations: ['profile', 'ssoProviders'],
    });

    if (existingUser) {
      // Link SSO provider to existing user
      await this.linkProviderToUser(existingUser, userData);
      const userDto = UserMapper.toDto(existingUser);
      const token = this.generateToken(existingUser);
      return { user: userDto, token, isNewUser: false };
    }

    // 3. Create new user with SSO provider
    const newUser = await this.createUserFromSso(userData);
    const userDto = UserMapper.toDto(newUser);
    const token = this.generateToken(newUser);
    return { user: userDto, token, isNewUser: true };
  }

  private async createUserFromSso(userData: SsoUserData): Promise<User> {
    // Generate unique pseudo from name or email
    const basePseudo = userData.firstName
      ? `${userData.firstName}${userData.lastName}`
          .toLowerCase()
          .replace(/\s/g, '')
      : userData.email.split('@')[0];

    const pseudo = await this.generateUniquePseudo(basePseudo);

    // Create profile
    const profile = this.profileRepository.create({
      firstName: userData.firstName || 'User',
      lastName: userData.lastName || '',
      pseudo,
    });

    // Create user
    const user = this.userRepository.create({
      email: userData.email,
      password: undefined,
      isActive: true,
      profile,
    });

    // Create SSO provider
    const ssoProvider = this.ssoProviderRepository.create({
      provider: userData.provider,
      providerId: userData.providerId,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      metadata: { profilePhoto: userData.profilePhoto },
      user,
    });

    user.ssoProviders = [ssoProvider];

    return await this.userRepository.save(user);
  }

  private async linkProviderToUser(
    user: User,
    userData: SsoUserData,
  ): Promise<void> {
    // Check if this provider type already linked
    const existingProviderOfType = await this.ssoProviderRepository.findOne({
      where: {
        user: { id: user.id },
        provider: userData.provider,
      },
    });

    if (existingProviderOfType) {
      throw new ConflictException(
        `${userData.provider} account already linked to this user`,
      );
    }

    const ssoProvider = this.ssoProviderRepository.create({
      provider: userData.provider,
      providerId: userData.providerId,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      metadata: { profilePhoto: userData.profilePhoto },
      user,
    });

    await this.ssoProviderRepository.save(ssoProvider);
  }

  private async updateProviderTokens(
    provider: SsoProvider,
    userData: SsoUserData,
  ): Promise<void> {
    // Use update() instead of save() to avoid overwriting user_id with null
    await this.ssoProviderRepository.update(provider.id, {
      accessToken: userData.accessToken || '',
      refreshToken: userData.refreshToken || '',
      tokenExpiry: this.calculateTokenExpiry(),
    });
  }

  private async generateUniquePseudo(basePseudo: string): Promise<string> {
    let pseudo = basePseudo;
    let counter = 1;

    while (await this.profileRepository.findOne({ where: { pseudo } })) {
      pseudo = `${basePseudo}${counter}`;
      counter++;
    }

    return pseudo;
  }

  private calculateTokenExpiry(): Date {
    // Google tokens typically expire in 1 hour
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getUserProviders(userId: string): Promise<AuthProviderType[]> {
    const providers = await this.ssoProviderRepository.find({
      where: { user: { id: userId } },
      select: ['provider'],
    });

    return providers.map((p) => p.provider);
  }

  async unlinkProvider(
    userId: string,
    provider: AuthProviderType,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['ssoProviders'],
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    // Ensure user has at least one other auth method
    if (user.ssoProviders.length <= 1 && !user.password) {
      throw new ConflictException(
        'Cannot unlink the only authentication method',
      );
    }

    await this.ssoProviderRepository.delete({
      user: { id: userId },
      provider,
    });
  }

  async authenticateWithGoogleToken(idToken: string): Promise<{
    success: boolean;
    token: string;
    user: UserDto;
    isNewUser: boolean;
  }> {
    // Valider le token Google
    const payload = await this.verifyGoogleToken(idToken);

    // Extraire les données user
    const userData: SsoUserData = {
      email: payload.email!,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      providerId: payload.sub,
      provider: AuthProviderType.GOOGLE,
      profilePhoto: payload.picture,
    };

    // Créer/récupérer user (logique existante)
    const result = await this.findOrCreateUserFromSso(userData);

    return {
      success: true,
      token: result.token,
      user: result.user,
      isNewUser: result.isNewUser,
    };
  }

  private async verifyGoogleToken(idToken: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Accept multiple audiences: Web + Android + iOS
    const audiences = [
      process.env.GOOGLE_CLIENT_ID, // Web
      process.env.GOOGLE_CLIENT_ID_ANDROID, // Android (optional)
      process.env.GOOGLE_CLIENT_ID_IOS, // iOS (optional)
    ].filter((id): id is string => Boolean(id)); // Remove undefined values

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: audiences,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async authenticateWithAppleToken(identityToken: string): Promise<{
    success: boolean;
    token: string;
    user: UserDto;
    isNewUser: boolean;
  }> {
    // Valider le token Apple
    const payload = await this.verifyAppleToken(identityToken);

    // Extraire les données user
    const userData: SsoUserData = {
      email: payload.email!,
      firstName: '', // Apple ne donne le nom qu'au premier login
      lastName: '',
      providerId: payload.sub,
      provider: AuthProviderType.APPLE,
    };

    // Créer/récupérer user (logique existante)
    const result = await this.findOrCreateUserFromSso(userData);

    return {
      success: true,
      token: result.token,
      user: result.user,
      isNewUser: result.isNewUser,
    };
  }

  private async verifyAppleToken(identityToken: string) {
    try {
      const payload = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID!,
      });

      if (!payload) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }
}

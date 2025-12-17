import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { SsoProvider } from './entities/sso-provider.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { AppleAuthStrategy } from './strategies/apple-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, SsoProvider]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const expiresIn = process.env.JWT_EXPIRATION || '24h';
        return {
          secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    JwtStrategy,
    LocalAuthStrategy,
    GoogleAuthStrategy,
    // AppleAuthStrategy, // TODO: Uncomment when Apple Developer account is ready
  ],
  exports: [UserService, AuthService, JwtStrategy],
})
export class UserModule {}

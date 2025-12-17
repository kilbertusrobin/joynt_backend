import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthStrategy, SsoUserData } from './auth-strategy.interface';
import { UserService } from '../user.service';
import { AuthProviderType } from '../enums/auth-provider-type.enum';

@Injectable()
export class LocalAuthStrategy
  extends PassportStrategy(Strategy, 'local')
  implements AuthStrategy
{
  provider = AuthProviderType.LOCAL;

  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.userService.validateLocalUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  extractUserInfo(profile: any): SsoUserData {
    throw new Error('Not applicable for local strategy');
  }
}

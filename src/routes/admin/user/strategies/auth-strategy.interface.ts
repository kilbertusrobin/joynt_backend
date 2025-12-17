import { AuthProviderType } from '../enums/auth-provider-type.enum';

export interface SsoUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  providerId: string;
  provider: AuthProviderType;
  accessToken?: string;
  refreshToken?: string;
  profilePhoto?: string;
}

export abstract class AuthStrategy {
  abstract provider: AuthProviderType;

  abstract validate(...args: any[]): Promise<any>;

  abstract extractUserInfo(profile: any): SsoUserData;
}

import { AuthProviderType } from '../enums/auth-provider-type.enum';

export class SsoProviderDto {
  id: string;
  provider: AuthProviderType;
  providerId: string;
  createdAt: Date;
}
